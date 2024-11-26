import {tokenize} from "linkifyjs";

function escapeText(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHref(href: string) {
  return href.replace(/"/g, "&quot;");
}

export function postTextToHtml(text: string) {
  const result: string[] = [];
  const tokens = tokenize(text.replace(/\r\n|\r/g, "\n"));

  for (const token of tokens) {
    if (token.t === "nl") {
      result.push("<br>");
    } else if (!token.isLink) {
      result.push(escapeText(token.toString()));
    } else {
      const href = escapeHref(token.toHref());
      const content = escapeText(token.toString());
      result.push(`<a href="${href}">${content}</a>`);
    }
  }

  return `<p>${result.join("")}</p>`;
}
