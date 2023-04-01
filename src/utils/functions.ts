import { ChangeEvent } from "react";

export function updateTextareaHeight(e: ChangeEvent<HTMLTextAreaElement>) {
  e.target.style.height = "0px";
  const scrollHeight = e.target.scrollHeight;
  e.target.style.height = `${scrollHeight}px`;
}
