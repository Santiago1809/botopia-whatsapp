"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ReactFlowProvider, addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import { type Node, type Edge, type Connection, type NodeChange, type EdgeChange } from "reactflow";
import 'reactflow/dist/style.css';
import { Sidebar } from "@/components/flows/sidebar";
import { FlowCanvas } from "@/components/flows/flowcanvas";
import { WhatsAppNode } from '@/components/flows/baruc/whatsappbaruc/bloquewhatsapp';
import { useWhatsApp } from '@/context/WhatsAppContext';

const nodeTypes = {
  whatsappNode: WhatsAppNode,
};

export default function FlowPage() {
  const {fetchAccounts } = useWhatsApp();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    []
  );

  useEffect(() => {
    const isAuthenticated = true; // Replace with your auth logic
    
    if (!isAuthenticated) {
      // Handle logout
      return;
    }

    fetchAccounts();
  }, [fetchAccounts]);

  return (
    <ReactFlowProvider>
      <Sidebar />
      <FlowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        setNodes={setNodes}
        nodeTypes={nodeTypes}
      />
    </ReactFlowProvider>
  );
}
