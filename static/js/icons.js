/* ============================================================================
   Base Agency Design System — Icon set
   One family, one visual language: 24x24 grid, 1.75 stroke, round caps/joins.
   No emoji anywhere in the product. Decorative icons beside visible text get
   aria-hidden; standalone icon controls get an accessible name from the button.
   ========================================================================= */
(function (global) {
  "use strict";

  var P = {
    /* Navigation / modules */
    grid:        '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    inbox:       '<path d="M4 13h4l1.5 3h5L16 13h4"/><path d="M5.4 4.6h13.2a2 2 0 0 1 1.9 1.4L22 13v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5L3.5 6a2 2 0 0 1 1.9-1.4Z"/>',
    userSquare:  '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="10" r="2.6"/><path d="M7 18a5.2 5.2 0 0 1 10 0"/>',
    calendarCheck:'<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="m9.5 15.5 1.8 1.8 3.4-3.6"/>',
    clock:       '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.4 2"/>',
    award:       '<circle cx="12" cy="9" r="5.5"/><path d="m8.6 13.6-1.4 7 4.8-2.6 4.8 2.6-1.4-7"/>',
    wallet:      '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1"/><rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><circle cx="16.5" cy="13.8" r="1.3"/>',
    briefcase:   '<rect x="2.5" y="7" width="19" height="13" rx="2.5"/><path d="M8.5 7V5.4A1.9 1.9 0 0 1 10.4 3.5h3.2a1.9 1.9 0 0 1 1.9 1.9V7"/><path d="M2.5 12.5h19"/>',
    portal:      '<rect x="2.5" y="4" width="19" height="14" rx="2.5"/><path d="M8 21h8M12 18v3"/><path d="M2.5 9h19"/>',
    megaphone:   '<path d="m3 11 14-6v14L3 13z"/><path d="M3 11H2.6A1.6 1.6 0 0 0 1 12.6v-.2A1.6 1.6 0 0 0 2.6 14H3z"/><path d="M17 9.2a3 3 0 0 1 0 5.6"/><path d="M6.5 14.2 8 20.5"/>',
    chartBar:    '<path d="M3 20.5h18"/><rect x="4.5" y="11" width="4" height="7" rx="1"/><rect x="10" y="6.5" width="4" height="11.5" rx="1"/><rect x="15.5" y="14" width="4" height="4" rx="1"/>',

    /* UI */
    search:      '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
    bell:        '<path d="M18 8.5a6 6 0 1 0-12 0c0 5.2-2 6.5-2 6.5h16s-2-1.3-2-6.5Z"/><path d="M13.7 19a2 2 0 0 1-3.4 0"/>',
    menu:        '<path d="M3.5 7h17M3.5 12h17M3.5 17h17"/>',
    close:       '<path d="M6 6l12 12M18 6 6 18"/>',
    chevronDown: '<path d="m5.5 9 6.5 6.5L18.5 9"/>',
    chevronRight:'<path d="m9 5.5 6.5 6.5L9 18.5"/>',
    chevronLeft: '<path d="M15 5.5 8.5 12 15 18.5"/>',
    arrowUp:     '<path d="M12 19.5v-15M5.5 11 12 4.5 18.5 11"/>',
    arrowDown:   '<path d="M12 4.5v15M5.5 13 12 19.5 18.5 13"/>',
    arrowRight:  '<path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5"/>',
    minus:       '<path d="M5.5 12h13"/>',
    plus:        '<path d="M12 5.5v13M5.5 12h13"/>',
    check:       '<path d="m5 12.5 4.6 4.6L19 7.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.2 12.3 2.6 2.6 5-5.2"/>',
    xCircle:     '<circle cx="12" cy="12" r="9"/><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6"/>',
    alert:       '<path d="M12 3.8 21 19.5H3z"/><path d="M12 9.8v4M12 16.6v.1"/>',
    info:        '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8v.1"/>',
    lock:        '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>',
    shield:      '<path d="M12 3 20 6v5.6c0 4.7-3.3 8-8 9.4-4.7-1.4-8-4.7-8-9.4V6z"/><path d="m9 12 2.2 2.2L15.2 10"/>',
    eye:         '<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.9"/>',
    eyeOff:      '<path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.7c6 0 9.5 6.2 9.5 6.2a17 17 0 0 1-2.8 3.6M6.3 7.9A16.6 16.6 0 0 0 2.5 12S6 18.2 12 18.2a9.7 9.7 0 0 0 3.5-.6"/><path d="M10 10a2.9 2.9 0 0 0 4 4"/><path d="M3.5 3.5l17 17"/>',
    download:    '<path d="M12 3.8v11M7.8 10.6 12 14.8l4.2-4.2"/><path d="M4.5 16.5v2A2.5 2.5 0 0 0 7 21h10a2.5 2.5 0 0 0 2.5-2.5v-2"/>',
    printer:     '<path d="M7 8.5V3.5h10v5"/><rect x="3.5" y="8.5" width="17" height="7.5" rx="2"/><rect x="7" y="14" width="10" height="6.5" rx="1"/>',
    filter:      '<path d="M3.5 5.5h17l-6.6 7.6v5.6l-3.8 2v-7.6z"/>',
    settings:    '<circle cx="12" cy="12" r="3"/><path d="M19.4 14.4a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1v-.3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z"/>',
    logout:      '<path d="M9.5 20.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5h3.5"/><path d="M15.5 16.5 20 12l-4.5-4.5M20 12H9"/>',
    globe:       '<circle cx="12" cy="12" r="9"/><path d="M3.2 9.8h17.6M3.2 14.2h17.6"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
    users:       '<circle cx="9.2" cy="8.6" r="3.4"/><path d="M2.8 19.5a6.4 6.4 0 0 1 12.8 0"/><path d="M16.4 5.6a3.4 3.4 0 0 1 0 6.6M17.6 14.4a6.4 6.4 0 0 1 3.6 5.1"/>',
    user:        '<circle cx="12" cy="8.4" r="3.8"/><path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0"/>',
    file:        '<path d="M13.5 3.5H7A2.5 2.5 0 0 0 4.5 6v12A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5V9.5z"/><path d="M13.5 3.5v6h6"/>',
    fileCheck:   '<path d="M13.5 3.5H7A2.5 2.5 0 0 0 4.5 6v12A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5V9.5z"/><path d="M13.5 3.5v6h6"/><path d="m9 15.2 1.8 1.8 3.4-3.6"/>',
    receipt:     '<path d="M5 3.5h14v17l-2.3-1.4-2.4 1.4-2.3-1.4-2.4 1.4L7.3 19 5 20.5z"/><path d="M9 8.5h6M9 12.5h6"/>',
    mail:        '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 7.5 7.3 5a2 2 0 0 0 2.4 0l7.3-5"/>',
    message:     '<path d="M20.5 11.4a7.7 7.7 0 0 1-8.3 7.7 8.8 8.8 0 0 1-3.2-.7L3.5 20l1.6-5.2a7.7 7.7 0 0 1-.6-3.1 7.7 7.7 0 0 1 8.2-7.7 7.7 7.7 0 0 1 7.8 7.4Z"/>',
    phone:       '<path d="M7 3.5H5.2A2.2 2.2 0 0 0 3 5.9C3 13.6 10.4 21 18.1 21a2.2 2.2 0 0 0 2.4-2.2V17l-4-1.7-2 2a13.4 13.4 0 0 1-5.6-5.6l2-2z"/>',
    home:        '<path d="m3.5 10 8.5-6.6L20.5 10v9a1.6 1.6 0 0 1-1.6 1.6H5.1A1.6 1.6 0 0 1 3.5 19z"/><path d="M9.5 20.5v-7h5v7"/>',
    trend:       '<path d="M3 16.5 9 10l4 4 8-8.5"/><path d="M15.5 5.5H21v5.5"/>',
    layers:      '<path d="m12 3 9 4.6-9 4.6-9-4.6z"/><path d="m3 12.4 9 4.6 9-4.6M3 16.9l9 4.6 9-4.6"/>',
    book:        '<path d="M4 4.6A1.6 1.6 0 0 1 5.6 3H18a1 1 0 0 1 1 1v14.5a1 1 0 0 1-1 1H5.6A1.6 1.6 0 0 0 4 21z"/><path d="M4 18.4a1.6 1.6 0 0 1 1.6-1.4H19"/>',
    building:    '<rect x="4" y="3" width="12" height="18" rx="1.6"/><path d="M16 9h3.2A1.8 1.8 0 0 1 21 10.8V21"/><path d="M8 7h4M8 11h4M8 15h4M16 13h2M16 17h2"/><path d="M3 21h18"/>',
    door:        '<path d="M4.5 21V4.5A1.5 1.5 0 0 1 6 3h9a1.5 1.5 0 0 1 1.5 1.5V21"/><path d="M3 21h18"/><circle cx="13.2" cy="12.4" r="0.9" fill="currentColor" stroke="none"/>',
    swap:        '<path d="M7 4.5 3.5 8 7 11.5M3.5 8h13"/><path d="m17 12.5 3.5 3.5-3.5 3.5M20.5 16h-13"/>',
    history:     '<path d="M3.6 9.6A9 9 0 1 1 3 12"/><path d="M3.2 4.5v5.2h5.2"/><path d="M12 7.5V12l3.2 1.9"/>',
    sparkle:     '<path d="m12 3 1.9 5.4L19.5 10l-5.6 1.6L12 17l-1.9-5.4L4.5 10l5.6-1.6z"/><path d="m18.5 16 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    external:    '<path d="M13.5 4.5h6v6"/><path d="m19.5 4.5-8 8"/><path d="M18 14v4.5a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2H10"/>',
    table:       '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M3 9.5h18M3 14.5h18M9.5 9.5v10"/>',
    dot:         '<circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none"/>'
  };

  /* ---- Retail additions -------------------------------------------------
     Same 24x24 grid and 1.75 stroke as the set above — a POS needs a
     barcode, a scale and a cash drawer, and nothing in a school icon set
     covers them.
     -------------------------------------------------------------------- */
  var RETAIL = {
    /* SAMS additions — same grid, same stroke */
    pencil:      '<path d="M4 20h4L19.3 8.7a2.3 2.3 0 0 0 0-3.2l-.8-.8a2.3 2.3 0 0 0-3.2 0L4 16z"/><path d="m13.5 6.5 4 4"/>',
    upload:      '<path d="M12 15.5v-11M6.5 9 12 3.5 17.5 9"/><path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15"/>',
    graduation:  '<path d="M2 9.5 12 5l10 4.5-10 4.5z"/><path d="M6 11.3v4.6c0 1.4 2.7 3.1 6 3.1s6-1.7 6-3.1v-4.6"/><path d="M22 9.5v5"/>',
    barcode:     '<path d="M3 5.5v13M6.2 5.5v13M9 5.5v9M11.6 5.5v13M14.6 5.5v9M17.4 5.5v13M21 5.5v13"/>',
    scan:        '<path d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16"/><path d="M3 12h18"/>',
    cart:        '<circle cx="9.5" cy="20" r="1.5"/><circle cx="17.5" cy="20" r="1.5"/><path d="M2.5 3.5h2.2l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h9a1.6 1.6 0 0 0 1.6-1.3L21 7H5.6"/>',
    banknote:    '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
    coins:       '<ellipse cx="9" cy="6.5" rx="6" ry="2.8"/><path d="M3 6.5v4c0 1.5 2.7 2.8 6 2.8s6-1.3 6-2.8v-4"/><path d="M15 11.4c3 .3 6 1.5 6 3.1v3c0 1.5-2.7 2.8-6 2.8s-6-1.3-6-2.8v-3"/>',
    drawer:      '<rect x="2.5" y="7.5" width="19" height="12" rx="2"/><path d="M2.5 12.5h19"/><path d="M9.5 16h5"/><path d="M6 7.5 8 4h8l2 3.5"/>',
    scale:       '<path d="M12 3.5v17M6.5 20.5h11"/><path d="M12 6.5 4 9l2.4 5.2a3.4 3.4 0 0 0 5.2-1.4zM12 6.5 20 9l-2.4 5.2a3.4 3.4 0 0 1-5.2-1.4z"/>',
    box:         '<path d="m12 3 8.5 4.3v9.4L12 21l-8.5-4.3V7.3z"/><path d="m3.5 7.3 8.5 4.4 8.5-4.4M12 11.7V21"/>',
    boxes:       '<rect x="2.5" y="12" width="8.5" height="8.5" rx="1.5"/><rect x="13" y="12" width="8.5" height="8.5" rx="1.5"/><rect x="7.7" y="3.5" width="8.5" height="8.5" rx="1.5"/>',
    truck:       '<path d="M2.5 6.5A1.5 1.5 0 0 1 4 5h9.5v11H2.5z"/><path d="M13.5 9H18l3.5 3.5V16h-8z"/><circle cx="7" cy="18.5" r="2"/><circle cx="17" cy="18.5" r="2"/>',
    tag:         '<path d="M11.6 3.5H20a.5.5 0 0 1 .5.5v8.4a2 2 0 0 1-.6 1.4l-6.2 6.2a1.6 1.6 0 0 1-2.3 0l-7.4-7.4a1.6 1.6 0 0 1 0-2.3l6.2-6.2a2 2 0 0 1 1.4-.6Z"/><circle cx="16.4" cy="7.6" r="1.5"/>',
    percent:     '<path d="M19 5 5 19"/><circle cx="7.6" cy="7.6" r="2.6"/><circle cx="16.4" cy="16.4" r="2.6"/>',
    gift:        '<rect x="3" y="8.5" width="18" height="4" rx="1"/><path d="M4.5 12.5v7A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5v-7M12 8.5V21"/><path d="M12 8.5S10.4 3 7.8 3a2.4 2.4 0 0 0 0 5.5zM12 8.5S13.6 3 16.2 3a2.4 2.4 0 0 1 0 5.5z"/>',
    apple:       '<path d="M12 7.4c-1.6-1.6-4.4-1.8-6.1.4-1.9 2.5-1 7 1.4 10 1 1.3 2.2 1.6 3.2 1.2.9-.4 1.7-.4 2.6 0 1 .4 2.2.1 3.2-1.2 2.4-3 3.3-7.5 1.4-10-1.7-2.2-4.5-2-6.1-.4Z"/><path d="M12 7.4V5a2.4 2.4 0 0 1 2.4-2.4"/>',
    calendar:    '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    calendarX:   '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="m10 14 4 4M14 14l-4 4"/>',
    trash:       '<path d="M4 6.5h16"/><path d="M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5"/><path d="M6 6.5 6.8 19a2 2 0 0 0 2 1.9h6.4a2 2 0 0 0 2-1.9l.8-12.5"/><path d="M10 10.5v6M14 10.5v6"/>',
    pause:       '<rect x="6.5" y="4" width="4" height="16" rx="1.4"/><rect x="13.5" y="4" width="4" height="16" rx="1.4"/>',
    play:        '<path d="M6.5 4.6a1 1 0 0 1 1.5-.9l10.6 6.4a1 1 0 0 1 0 1.8L8 18.3a1 1 0 0 1-1.5-.9z"/>',
    refresh:     '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 4v5h-5"/>',
    undo:        '<path d="M3.5 9.5h9.8a5.7 5.7 0 0 1 0 11.4H8"/><path d="m7.5 5-4 4.5 4 4.5"/>',
    scissors:    '<circle cx="6.5" cy="6.5" r="2.6"/><circle cx="6.5" cy="17.5" r="2.6"/><path d="M8.6 8.2 20 18.5M20 5.5 8.6 15.8"/>',
    star:        '<path d="m12 3.8 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 10l5.9-.8z"/>',
    warehouse:   '<path d="M2.5 20.5V8.6a2 2 0 0 1 1.3-1.9l7.5-3a2 2 0 0 1 1.4 0l7.5 3a2 2 0 0 1 1.3 1.9v11.9"/><path d="M6.5 20.5v-7h11v7"/><path d="M6.5 17h11M2.5 20.5h19"/>',
    branch:      '<path d="M3 21V8.5L10 4v17"/><path d="M10 9.5 21 6v15"/><path d="M2 21h20"/><path d="M6 12h1M6 16h1M14 11h1M14 15h1M17.5 11h1M17.5 15h1"/>',
    database:    '<ellipse cx="12" cy="5.8" rx="8" ry="3"/><path d="M4 5.8v12.4c0 1.7 3.6 3 8 3s8-1.3 8-3V5.8"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    wifiOff:     '<path d="M3.5 3.5 20.5 20.5"/><path d="M2 8.8a16 16 0 0 1 4.6-2.7M10.2 5.2A16 16 0 0 1 22 8.8"/><path d="M5.5 12.4a11 11 0 0 1 2.6-1.6M15 11.6a11 11 0 0 1 3.5 2.3"/><path d="M9 15.9a6 6 0 0 1 5.4.6"/><path d="M12 19.5v.1"/>',
    key:         '<circle cx="8" cy="8" r="4.5"/><path d="m11.4 11.4 8 8M17 17l2-2M14.4 14.4l2-2"/>',
    weight:      '<path d="M5.2 8.5h13.6l1.7 11a1.6 1.6 0 0 1-1.6 1.9H5.1a1.6 1.6 0 0 1-1.6-1.9z"/><circle cx="12" cy="5.5" r="2.6"/>',
    trendDown:   '<path d="M3 7.5 9 14l4-4 8 8.5"/><path d="M15.5 18.5H21V13"/>',
    filterOff:   '<path d="M3.5 5.5h17l-6.6 7.6v5.6l-3.8 2v-7.6z"/><path d="m3 3 18 18"/>',
    clipboard:   '<rect x="4.5" y="4.5" width="15" height="16" rx="2"/><path d="M9 4.5V3.6A1.6 1.6 0 0 1 10.6 2h2.8A1.6 1.6 0 0 1 15 3.6v.9z" /><path d="M8.5 11h7M8.5 15h4"/>',
    listCheck:   '<path d="M9.5 6.5h11M9.5 12h11M9.5 17.5h11"/><path d="m3 6 1.4 1.4L7 4.6M3 17.4 4.4 18.8 7 16"/><path d="M3.6 11.4h2.8"/>'
  };
  Object.keys(RETAIL).forEach(function (k) { P[k] = RETAIL[k]; });

  /**
   * Build an icon.
   * @param {string} name  key from the set above
   * @param {object} [opt] { size, cls, label }
   *        label -> role="img" + <title>; omitted -> aria-hidden (decorative)
   */
  function icon(name, opt) {
    opt = opt || {};
    var body = P[name];
    if (!body) { body = P.dot; }
    var size = opt.size || 24;
    var a11y = opt.label
      ? ' role="img" aria-label="' + String(opt.label).replace(/"/g, "&quot;") + '"'
      : ' aria-hidden="true" focusable="false"';
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '"' +
      ' fill="none" stroke="currentColor" stroke-width="1.75"' +
      ' stroke-linecap="round" stroke-linejoin="round"' +
      (opt.cls ? ' class="' + opt.cls + '"' : "") + a11y + ">" + body + "</svg>";
  }

  icon.has = function (name) { return Object.prototype.hasOwnProperty.call(P, name); };

  global.Icon = icon;
})(window);
