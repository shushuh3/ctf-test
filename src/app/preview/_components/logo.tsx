export function Logo() {
  return (
    <div className="sidebar-brand">
      <span className="brand-mark" aria-hidden>
        {/* Stylised shield-check — банковская безопасность в упрощённой форме */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2 4 5v6c0 4.5 3 8.5 8 11 5-2.5 8-6.5 8-11V5l-8-3Z"
            fill="currentColor"
            opacity="0.25"
          />
          <path
            d="M12 2 4 5v6c0 4.5 3 8.5 8 11 5-2.5 8-6.5 8-11V5l-8-3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="m8.5 12 2.5 2.5L16 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="brand-wordmark">
        <div className="wordmark-top">CFT Audit</div>
        <div className="wordmark-sub">Security Portal</div>
      </div>
    </div>
  );
}
