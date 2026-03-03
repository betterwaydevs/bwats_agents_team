import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TypeBadge } from "@/components/dashboard/TypeBadge";
import type { BacklogTask } from "@/lib/types";

interface TaskTableProps {
  tasks: BacklogTask[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-28">Type</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-32">Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="cursor-pointer">
              <TableCell>
                <Link
                  href={`/tasks/${task.id}`}
                  className="font-mono text-xs text-muted-foreground hover:underline"
                >
                  {task.id}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/tasks/${task.id}`}
                  className="hover:underline"
                >
                  {task.title}
                </Link>
              </TableCell>
              <TableCell>
                <TypeBadge type={task.type} />
              </TableCell>
              <TableCell>
                <StatusBadge status={task.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {task.owner}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
