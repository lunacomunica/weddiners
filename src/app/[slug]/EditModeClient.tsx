"use client";

import { useEffect } from "react";

export function EditModeClient() {
  useEffect(() => {
    // Só ativa quando dentro de um iframe (editor do dashboard)
    if (typeof window === "undefined" || window.self === window.top) return;

    document.body.setAttribute("data-edit-mode", "true");

    // Adiciona estilos de hover
    const style = document.createElement("style");
    style.innerHTML = `
      [data-weddiners-section] {
        position: relative;
        cursor: pointer;
        transition: outline 0.15s;
      }
      [data-weddiners-section]:hover {
        outline: 2px solid #3B82F6;
        outline-offset: -2px;
      }
      [data-weddiners-section]:hover .weddiners-edit-btn {
        display: flex !important;
      }
      .weddiners-edit-btn {
        display: none;
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        background: white;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 8px 16px;
        gap: 8px;
        align-items: center;
        font-size: 13px;
        font-weight: 600;
        color: #111;
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        white-space: nowrap;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    // Adiciona botão de editar em cada seção
    function setupSections() {
      const sections = document.querySelectorAll("[data-weddiners-section]");
      sections.forEach((section) => {
        if (section.querySelector(".weddiners-edit-btn")) return;

        const btn = document.createElement("div");
        btn.className = "weddiners-edit-btn";
        btn.innerHTML = `
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Editar seção
        `;
        section.appendChild(btn);

        section.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const sectionId = (section as HTMLElement).dataset.weddinersSection;
          window.parent.postMessage(
            { type: "weddiners-section-click", sectionId },
            "*"
          );
        });
      });
    }

    setupSections();

    // Re-executa se o DOM mudar (seções dinâmicas)
    const observer = new MutationObserver(setupSections);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
