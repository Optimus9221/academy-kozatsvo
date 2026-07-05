"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Leader {
  id: string;
  name: string;
  position: string;
  order: number;
}

function SortableLeaderRow({
  leader,
  onDelete,
  deleteLabel,
  editLabel,
}: {
  leader: Leader;
  onDelete: (id: string) => void;
  deleteLabel: string;
  editLabel: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: leader.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="w-10 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        ⠿
      </td>
      <td>{leader.name}</td>
      <td>{leader.position}</td>
      <td>{leader.order}</td>
      <td className="space-x-2">
        <Link href={`/admin/leadership/${leader.id}`} className="text-ukraine-blue hover:underline">
          {editLabel}
        </Link>
        <button onClick={() => onDelete(leader.id)} className="text-red-600 hover:underline">
          {deleteLabel}
        </button>
      </td>
    </tr>
  );
}

export default function AdminLeadershipPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [leaders, setLeaders] = useState<Leader[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetch("/api/admin/leadership").then((r) => r.json()).then(setLeaders);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/admin/leadership/${id}`, { method: "DELETE" });
    setLeaders((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = leaders.findIndex((l) => l.id === active.id);
    const newIndex = leaders.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(leaders, oldIndex, newIndex).map((l, index) => ({
      ...l,
      order: index,
    }));

    setLeaders(reordered);

    await fetch("/api/admin/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "leader",
        items: reordered.map((l, index) => ({ id: l.id, order: index })),
      }),
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">{t("leadership")}</h1>
        <Link href="/admin/leadership/new" className="admin-btn admin-btn-primary">
          + {t("newLeader")}
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-md">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-10"></th>
                <th>{t("name")}</th>
                <th>{t("position")}</th>
                <th>{t("order")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={leaders.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {leaders.map((l) => (
                  <SortableLeaderRow
                    key={l.id}
                    leader={l}
                    onDelete={handleDelete}
                    editLabel={tc("edit")}
                    deleteLabel={tc("delete")}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
