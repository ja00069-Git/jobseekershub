"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  APPLICATION_STATUS_OPTIONS,
  getStatusLabel,
  type ApplicationStatus,
} from "@/lib/application-status";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
};

const statuses = APPLICATION_STATUS_OPTIONS.map((option) => option.value);

export default function KanbanBoard({
  applications,
}: {
  applications: Application[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(applications);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setItems(applications);
  }, [applications]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const activeItem = items.find((item) => item.id === activeId);
    const overStatus =
      (over.data.current?.status as ApplicationStatus | undefined) ??
      ((statuses.includes(String(over.id) as ApplicationStatus)
        ? String(over.id)
        : activeItem?.status) as ApplicationStatus | undefined);

    if (!activeItem || !overStatus || activeItem.status === overStatus) {
      return;
    }

    const previousItems = items;

    setItems((prev) =>
      prev.map((item) =>
        item.id === activeId ? { ...item, status: overStatus } : item,
      ),
    );

    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: activeId,
          status: overStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update application status.");
      }

      router.refresh();
    } catch {
      setItems(previousItems);
    }
  }

  const board = (
    <div className="w-full overflow-x-auto">
      <div className="grid min-w-[1220px] grid-cols-7 gap-4">
        {APPLICATION_STATUS_OPTIONS.map((option) => (
          <Column
            key={option.value}
            status={option.value}
            items={items}
            color={option.color}
            draggable={isMounted}
          />
        ))}
      </div>
    </div>
  );

  if (!isMounted) {
    return board;
  }

  return (
    <DndContext
      id="jobhunthq-kanban"
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {board}
    </DndContext>
  );
}

function Column({
  status,
  items,
  color,
  draggable,
}: {
  status: string;
  items: Application[];
  color: string;
  draggable: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  const filtered = items.filter((item) => item.status === status);

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[320px] flex-col rounded-2xl border p-3 transition ${
        isOver
          ? "border-blue-300 bg-blue-50/80"
          : "border-slate-200 bg-slate-50/70"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className={`rounded-full px-3 py-1 text-sm font-semibold ${color}`}>
          {getStatusLabel(status)}
        </h2>

        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
          {filtered.length}
        </span>
      </div>

      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((app) => (
            <DraggableCard key={app.id} app={app} draggable={draggable} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-3 text-sm text-slate-400">
            Drop an application here.
          </div>
        )}
      </div>
    </section>
  );
}

function DraggableCard({
  app,
  draggable,
}: {
  app: Application;
  draggable: boolean;
}) {
  if (!draggable) {
    return <StaticCard app={app} />;
  }

  return <InteractiveCard app={app} />;
}

function StaticCard({ app }: { app: Application }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="font-semibold text-slate-900">{app.role}</p>
      <p className="mt-1 text-sm text-slate-600">{app.company}</p>
    </div>
  );
}

function InteractiveCard({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: app.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isDragging ? "cursor-grabbing opacity-80 shadow-lg" : "cursor-grab"
      }`}
    >
      <p className="font-semibold text-slate-900">{app.role}</p>
      <p className="mt-1 text-sm text-slate-600">{app.company}</p>
    </div>
  );
}
