import React from "react";

export default function Divider(props: { space: number }) {
  return (
    <div
      className="h-0.5 w-full bg-zinc-500"
      style={{ marginTop: props.space, marginBottom: props.space }}
    ></div>
  );
}
