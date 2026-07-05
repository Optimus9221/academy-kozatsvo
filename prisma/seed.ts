import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./client";
import {
  aboutText,
  galleryAlbum,
  GALLERY_PHOTOS,
  heroImageUrl,
  heroSlogan,
  joinRulesHtml,
} from "./content/site-content";

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function clearAll() {
  await prisma.rateLimit.deleteMany();
  await prisma.newsTagRelation.deleteMany();
  await prisma.newsImage.deleteMany();
  await prisma.newsTranslation.deleteMany();
  await prisma.news.deleteMany();
  await prisma.newsTag.deleteMany();
  await prisma.galleryItemTranslation.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.galleryAlbumTranslation.deleteMany();
  await prisma.galleryAlbum.deleteMany();
  await prisma.leaderVideo.deleteMany();
  await prisma.leaderTranslation.deleteMany();
  await prisma.leader.deleteMany();
  await prisma.branchTranslation.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.partnerTranslation.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.joinRulesTranslation.deleteMany();
  await prisma.joinRules.deleteMany();
  await prisma.application.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.faqItemTranslation.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.eventTranslation.deleteMany();
  await prisma.event.deleteMany();
  await prisma.siteSettingsTranslation.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.user.deleteMany();
}

const aboutTextEn = `The International Public Organization «International Academy of Cossackdom» (IPO «IAC») is an independent international scientific and public organization that unites scientists, educators, representatives of Cossackdom, public figures, military personnel, volunteers, artists, and specialists from Ukraine and other countries.

The Academy is a platform for the development of science, education, culture, spirituality, patriotic education, and international partnership. Its activities are aimed at preserving the historical heritage of Ukrainian Cossackdom, supporting innovation, implementing socially important projects, and strengthening international cooperation.`;

async function main() {
  await clearAll();

  const adminHash = await hashPassword("admin123");
  await prisma.user.createMany({
    data: [
      { name: "Адміністратор", email: "admin@academy.ua", passwordHash: adminHash, role: "ADMIN" },
      { name: "Редактор", email: "editor@academy.ua", passwordHash: await hashPassword("editor123"), role: "EDITOR" },
      { name: "Модератор", email: "moderator@academy.ua", passwordHash: await hashPassword("moderator123"), role: "MODERATOR" },
    ],
  });

  const settings = await prisma.siteSettings.create({
    data: {
      siteName: "Міжнародна Академія Козацтва",
      logoUrl: "/images/logo-mak.svg",
      heroSlogan,
      heroImageUrl,
      aboutText,
      contactEmail: "A.Kremnev18@gmail.com",
      contactPhone: "8 (04497) 9-25-50, 8 (093) 291-06-33, 8 (044) 452-43-04",
      contactAddress: "м. Київ, 01011, вулиця Еспланадна, будинок 4, оф. 107",
      defaultSeoTitle: "МАК — Міжнародна Академія Козацтва",
      defaultSeoDescription: "Офіційний сайт МАК",
      socialLinksJson: JSON.stringify({
        youtube: "https://youtube.com",
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        telegram: "https://t.me",
      }),
    },
  });

  await prisma.siteSettingsTranslation.createMany({
    data: [
      { settingsId: settings.id, locale: "en", siteName: "International Academy of Cossacks", heroSlogan: "Science. Honor. Cossack Spirit. Service to Ukraine and Humanity.", aboutText: aboutTextEn, seoTitle: "IAC — International Academy of Cossacks", seoDescription: "Official IAC website" },
      { settingsId: settings.id, locale: "he", siteName: "האקדמיה הבינלאומית לקוזאקים", heroSlogan: "שימור מסורות, בניית עתיד", aboutText: "אקדמיה בינלאומית לקוזאקים (MAK)." },
      { settingsId: settings.id, locale: "kk", siteName: "Халықаралық Казактық Академиясы", heroSlogan: "Дәстүрлерді сақтау", aboutText: "МАК — казак даласын біріктіру." },
      { settingsId: settings.id, locale: "ru", siteName: "Международная Академия Казачества", heroSlogan: "Наука. Честь. Казацкий дух. Служение Украине и человечеству.", aboutText: "Международная общественная организация «Международная Академия Казачества» (МГО «МАК») — независимая международная научно-общественная организация." },
    ],
  });

  const general = await prisma.leader.create({
    data: {
      name: "Генерал Кремнєв",
      position: "Глава МАК",
      photoUrl: "/images/leader-general.jpg",
      bio: "<p>Глава <strong>МАК</strong>, присвятив життя збереженню козацьких традицій.</p>",
      order: 0,
      showHomeMessage: false,
    },
  });

  await prisma.leaderTranslation.createMany({
    data: [
      { leaderId: general.id, locale: "en", name: "General Kremnev", position: "Head of IAC", bio: "<p>Head of the <strong>IAC</strong>.</p>" },
      { leaderId: general.id, locale: "he", name: "גנרל פטרנקו", position: "ראש MAK", bio: "<p>ראש האקדמיה.</p>" },
    ],
  });

  await prisma.leader.create({
    data: {
      name: "Олександр Усик",
      position: "Заступник глави",
      photoUrl: "/images/leader-general.jpg",
      bio: "<p>Координує міжнародні представництва МАК.</p>",
      order: 1,
    },
  });

  await prisma.leaderVideo.create({
    data: {
      leaderId: general.id,
      youtubeUrl: "https://youtu.be/jHzJI5OyUf8?si=pak-YYWzHRV8tWRk",
      title: "Звернення глави МАК",
    },
  });

  const branchCoords: Record<string, { lat: number; lng: number }> = {
    Київ: { lat: 50.4501, lng: 30.5234 },
    Львів: { lat: 49.8397, lng: 24.0297 },
    Варшава: { lat: 52.2297, lng: 21.0122 },
    "Тель-Авів": { lat: 32.0853, lng: 34.7818 },
    Алмати: { lat: 43.222, lng: 76.8512 },
  };

  const branches = [
    { type: "UKRAINE" as const, name: "Київське представництво МАК", region: "м. Київ", city: "Київ", headName: "Іван Петренко", phone: "+380 50 111 22 33", email: "kyiv@academy.ua", address: "вул. Хрещатик, 1", order: 0 },
    { type: "UKRAINE" as const, name: "Львівське представництво", region: "Львівська", city: "Львів", headName: "Марія Коваленко", email: "lviv@academy.ua", order: 1 },
    { type: "INTERNATIONAL" as const, name: "Представництво в Польщі", country: "Польща", city: "Варшава", headName: "Олег Шевченко", email: "poland@academy.ua", order: 0 },
    { type: "INTERNATIONAL" as const, name: "Представництво в Ізраїлі", country: "Ізраїль", city: "Тель-Авів", headName: "Давид К.", email: "israel@academy.ua", order: 1 },
    { type: "INTERNATIONAL" as const, name: "Представництво в Казахстані", country: "Казахстан", city: "Алмати", headName: "Нурлан Б.", email: "kz@academy.ua", order: 2 },
  ];
  for (const b of branches) {
    const coords = branchCoords[b.city];
    await prisma.branch.create({
      data: {
        ...b,
        latitude: coords?.lat,
        longitude: coords?.lng,
      },
    });
  }

  const p1 = await prisma.partner.create({
    data: { name: "Український культурний фонд", description: "Стратегічний партнер МАК", logoUrl: "/images/partner-logo-1.png", websiteUrl: "https://ukf.ua", order: 0 },
  });
  await prisma.partnerTranslation.create({ data: { partnerId: p1.id, locale: "en", name: "Ukrainian Cultural Foundation", description: "Strategic partner" } });

  await prisma.partner.createMany({
    data: [
      { name: "Козацька рада", description: "Громадська організація", logoUrl: "/images/partner-logo-2.png", websiteUrl: "https://example.org", order: 1 },
      { name: "Міжнародний фонд", description: "Підтримка діаспори", logoUrl: "/images/partner-logo-1.png", order: 2 },
      { name: "Патріотичний альянс", description: "Освітні програми", order: 3 },
    ],
  });

  const newsItems = [
    { title: "Відкриття представництва у Львові", slug: "lviv-opening", preview: "МАК урочисто відкрила філію у Львові.", body: "<p>Демо-новина з фото.</p>", image: "/images/news-lviv-opening.jpg", tag: "Події" },
    { title: "Міжнародна конференція 2026", slug: "conference-2026", preview: "Щорічна конференція МАК.", body: "<p>Київ, серпень 2026.</p>", image: "/images/news-conference.jpg", tag: "Події" },
    { title: "МАК розширює мережу", slug: "mak-network", preview: "Нові філії в Ізраїлі та Казахстані.", body: "<p>Міжнародна діяльність.</p>", image: "/images/hero-cossacks-bg.jpg", tag: "Новини" },
    { title: "Патріотичний табір", slug: "youth-camp", preview: "Літній табір для молоді.", body: "<p>Демо-програма.</p>", image: "/images/news-youth-camp.jpg", tag: "Освіта" },
    { title: "Спільний проєкт з партнерами", slug: "partners-project", preview: "Освітня програма в школах.", body: "<p>Разом з партнерами.</p>", image: "/images/news-conference.jpg", tag: "Партнерство" },
  ];

  for (let i = 0; i < newsItems.length; i++) {
    const item = newsItems[i];
    const news = await prisma.news.create({
      data: {
        title: item.title,
        slug: item.slug,
        previewText: item.preview,
        body: item.body,
        mainImageUrl: item.image,
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - i * 86400000),
        author: "Редакція МАК",
      },
    });
    if (i === 0) {
      await prisma.newsTranslation.create({
        data: { newsId: news.id, locale: "en", title: "Lviv branch opening", previewText: "IAC opened a branch in Lviv.", body: "<p>Demo news.</p>" },
      });
    }
    const tagSlug = item.tag.toLowerCase().replace(/\s+/g, "-");
    const tag = await prisma.newsTag.upsert({
      where: { slug: tagSlug },
      create: { name: item.tag, slug: tagSlug },
      update: { name: item.tag },
    });
    await prisma.newsTagRelation.create({ data: { newsId: news.id, tagId: tag.id } });
  }

  const album = await prisma.galleryAlbum.create({
    data: {
      title: "Святкування Дня Козацтва",
      slug: "cossack-day",
      description: "Фото з заходів МАК",
      coverImageUrl: "/images/news-lviv-opening.jpg",
    },
  });
  await prisma.galleryItem.createMany({
    data: [
      { albumId: album.id, type: "PHOTO", imageUrl: "/images/news-lviv-opening.jpg", caption: "Парад", order: 0 },
      { albumId: album.id, type: "PHOTO", imageUrl: "/images/news-youth-camp.jpg", caption: "Табір", order: 1 },
      { albumId: album.id, type: "VIDEO", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Офіційне відео", order: 2 },
    ],
  });

  const materialsAlbum = await prisma.galleryAlbum.create({
    data: {
      title: galleryAlbum.title,
      slug: galleryAlbum.slug,
      description: galleryAlbum.description,
      coverImageUrl: GALLERY_PHOTOS[0],
    },
  });
  await prisma.galleryItem.createMany({
    data: GALLERY_PHOTOS.map((imageUrl, order) => ({
      albumId: materialsAlbum.id,
      type: "PHOTO" as const,
      imageUrl,
      order,
    })),
  });

  await prisma.joinRules.create({
    data: {
      contentHtml: joinRulesHtml,
      pdfUrls: JSON.stringify(["/about/documents/statut"]),
    },
  });

  const faq1 = await prisma.faqItem.create({
    data: {
      question: "Хто може вступити до МАК?",
      answerHtml: "<p>Громадяни України та інших країн від 18 років, які поділяють цінності Академії.</p>",
      order: 0,
    },
  });
  await prisma.faqItemTranslation.create({
    data: {
      faqItemId: faq1.id,
      locale: "en",
      question: "Who can join IAC?",
      answerHtml: "<p>Citizens of Ukraine and other countries aged 18+ who share the Academy's values.</p>",
    },
  });

  await prisma.faqItem.create({
    data: {
      question: "Скільки триває розгляд заявки?",
      answerHtml: "<p>Зазвичай до 14 днів. Статус надсилається на email.</p>",
      order: 1,
    },
  });

  await prisma.event.create({
    data: {
      title: "Міжнародна конференція МАК 2026",
      slug: "conference-2026",
      description: "<p>Щорічна конференція в Києві. Доповіді, круглі столи, культурна програма.</p>",
      location: "м. Київ",
      startsAt: new Date("2026-08-15T10:00:00"),
      endsAt: new Date("2026-08-17T18:00:00"),
      imageUrl: "/images/news-conference.jpg",
      status: "UPCOMING",
      translations: {
        create: {
          locale: "en",
          title: "IAC International Conference 2026",
          description: "<p>Annual conference in Kyiv.</p>",
          location: "Kyiv",
        },
      },
    },
  });

  console.log("Seed OK — upload images via admin or add to /public/images/");
}

main().catch(console.error).finally(() => prisma.$disconnect());
