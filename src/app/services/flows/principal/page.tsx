"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FlowSidebar } from "@/components/flows/principal/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodesCount: number;
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Flujo de Ventas",
      createdAt: "2025-06-12",
      updatedAt: "2025-06-12",
      nodesCount: 5,
    },
    {
      id: "2",
      name: "Flujo de Atención al Cliente",
      createdAt: "2025-06-11",
      updatedAt: "2025-06-12",
      nodesCount: 3,
    },
  ]);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  return (
    <div className="flex h-screen">
      <FlowSidebar />
      <div className="flex-1 ml-64">
        <div className="container py-6 px-4"> {/* Cambiado de py-8 a py-6 */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="space-y-1.5"> {/* Añadido space-y-1.5 */}
              <h1 className="text-2xl font-bold tracking-tight"> {/* Cambiado de text-3xl a text-2xl */}
                Mis Proyectos de Flujo
              </h1>
              <p className="text-muted-foreground text-sm"> {/* Añadido text-sm */}
                Gestiona y crea nuevos flujos de trabajo para WhatsApp.
              </p>
            </div>
            <Link href="/services/flows">
              <Button className="text-white bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </Link>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Buscar proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Nombre del Proyecto</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Última Modificación</TableHead>
                  <TableHead className="text-center">Nodos</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      {format(new Date(project.createdAt), "PPP", { locale: es })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(project.updatedAt), "PPP", { locale: es })}
                    </TableCell>
                    <TableCell className="text-center">
                      {project.nodesCount}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/services/flows/${project.id}`}>
                            <DropdownMenuItem>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No se encontraron proyectos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}