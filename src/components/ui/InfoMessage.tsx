import React from "react";
export default function InfoMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <strong>{title}</strong>
      <div>{description}</div>
    </div>
  );
}
