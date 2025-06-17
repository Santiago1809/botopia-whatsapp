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
    <div className="flex h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
      <FlowSidebar />
      <div className="flex-1 w-full lg:ml-80">
        {/* Container */}
        <div className="px-7 py-12 landscape:max-lg:px-7 landscape:max-lg:py-12 lg:px-7 lg:py-7">
          {/* Header section */}
          <div className="flex flex-col mb-6 landscape:max-lg:flex-row landscape:max-lg:items-center landscape:max-lg:mb-4 lg:flex-row lg:items-start lg:mb-12">
            {/* Title and description */}
            <div className="space-y-3 landscape:max-lg:space-y-2 lg:space-y-1.5">
              <h1 className="text-2xl font-bold text-foreground landscape:max-lg:text-xl lg:text-2xl">
                Mis Flujos
              </h1>
              <p className="text-sm text-muted-foreground landscape:max-lg:text-xs lg:text-ms">
                Gestiona y crea nuevos flujos de trabajo para WhatsApp.
              </p>
            </div>

            {/* Button container */}
            <div className="
              mt-6                          /* Móvil vertical */
              landscape:max-lg:mt-0  landscape:max-lg:ml-108         /* Solo móvil horizontal */
              lg:mt-0 lg:ml-auto           /* Solo desktop */
            ">
              <Link href="/services/flows">
                <Button className="
                  w-full h-12 px-4 text-base         /* Móvil vertical */
                  landscape:max-lg:w-auto 
                  landscape:max-lg:h-8             /* Solo móvil horizontal */
                  lg:h-12 lg:px-12 lg:text-xl       /* Solo desktop */
                  text-white bg-primary hover:bg-primary/90
                ">
                  <Plus className="
                    w-6 h-6 mr-2                     /* Móvil vertical */
                    landscape:max-lg:w-5 
                    landscape:max-lg:h-5             /* Solo móvil horizontal */
                    lg:w-8 lg:h-8 lg:mr-4           /* Solo desktop */
                  "/>
                  Nuevo Flujo
                </Button>
              </Link>
            </div>
          </div>

          {/* Search section */}
          <div className="relative w-full lg:max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 landscape:max-lg:w-4 landscape:max-lg:h-4 lg:w-7 lg:h-7 lg:left-6 text-muted-foreground" />
            <Input
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base landscape:max-lg:h-10 landscape:max-lg:text-sm lg:h-16 lg:text-xl lg:pl-16 bg-background dark:bg-[hsl(240,10%,20%)] dark:text-foreground"
            />
          </div>

          {/* Table section */}
          <div className="border rounded-lg shadow-md bg-card dark:bg-[hsl(240,10%,14%)] overflow-x-auto mt-6">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-border">
                  <TableHead className="w-[200px] p-4 text-base landscape:max-lg:w-[180px] landscape:max-lg:p-3 landscape:max-lg:text-sm lg:w-[400px] lg:p-6 lg:text-xl font-semibold text-foreground">
                    Nombre del Proyecto
                  </TableHead>
                  <TableHead className="
                    hidden                         /* Mobile vertical */
                    landscape:table-cell landscape:p-3 landscape:text-sm /* Mobile horizontal */
                    lg:table-cell lg:p-8 lg:text-2xl /* Desktop */
                    font-semibold text-foreground dark:text-foreground"
                  >
                    Fecha de Creación
                  </TableHead>
                  <TableHead className="
                    hidden                         /* Mobile vertical */
                    landscape:table-cell landscape:p-3 landscape:text-sm /* Mobile horizontal */
                    lg:table-cell lg:p-8 lg:text-2xl /* Desktop */
                    font-semibold text-foreground dark:text-foreground"
                  >
                    Última Modificación
                  </TableHead>
                  <TableHead className="
                    text-center p-4 text-base      /* Mobile vertical */
                    landscape:p-3 landscape:text-sm /* Mobile horizontal */
                    lg:p-8 lg:text-2xl            /* Desktop */
                    font-semibold text-foreground dark:text-foreground"
                  >
                    Nodos
                  </TableHead>
                  <TableHead className="
                    w-[60px] p-4                  /* Mobile vertical */
                    landscape:w-[50px] landscape:p-3 /* Mobile horizontal */
                    lg:w-[120px] lg:p-8           /* Desktop */
                  "></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="dark:border-border">
                    <TableCell className="
                      p-4 text-base                    /* Móvil vertical */
                      landscape:max-lg:p-3 
                      landscape:max-lg:text-sm        /* Solo móvil horizontal */
                      lg:p-6 lg:text-xl              /* Solo desktop */
                      text-foreground
                    ">
                      {project.name}
                    </TableCell>
                    <TableCell className="hidden landscape:table-cell lg:table-cell p-3 landscape:p-2 lg:p-6 text-sm landscape:text-xs lg:text-lg text-foreground">
                      {format(new Date(project.createdAt), "PPP", { locale: es })}
                    </TableCell>
                    <TableCell className="hidden landscape:table-cell lg:table-cell p-3 landscape:p-2 lg:p-6 text-sm landscape:text-xs lg:text-lg text-foreground">
                      {format(new Date(project.updatedAt), "PPP", { locale: es })}
                    </TableCell>
                    <TableCell className="text-center p-3 landscape:p-2 lg:p-6 text-sm landscape:text-xs lg:text-lg">
                      {project.nodesCount}
                    </TableCell>
                    <TableCell className="p-3 landscape:p-2 lg:p-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 landscape:h-6 w-8 landscape:w-6 p-0">
                            <MoreVertical className="h-4 landscape:h-3 w-4 landscape:w-3" />
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
                    <TableCell colSpan={5} className="text-center py-6 md:py-8 text-muted-foreground">
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