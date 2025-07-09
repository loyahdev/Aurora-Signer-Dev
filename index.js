document.addEventListener('DOMContentLoaded', function() {
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const dropdownMenu = document.getElementById('dropdownMenu');
  if (hamburgerMenu && dropdownMenu) {
    hamburgerMenu.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });
    document.addEventListener('click', function (e) {
      if (!dropdownMenu.contains(e.target) && !hamburgerMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });
  }

  // Forest-themed falling leaves effect
  (function() {
    const canvas = document.getElementById('stupidleaves');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, leaves = [];
    const numLeaves = 40;
    const leafColors = ['#b983ff', '#8f5cff', '#6a994e', '#386641', '#a7c957', '#f2e8cf'];
    const leafShapes = [ // simple leaf shapes (ellipses)
      {rx: 10, ry: 4},
      {rx: 8, ry: 3},
      {rx: 12, ry: 5}
    ];

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    }

    function createLeaf() {
      const shape = leafShapes[Math.floor(Math.random() * leafShapes.length)];
      return {
        x: Math.random() * w,
        y: -20 - Math.random() * h,
        speed: 1 + Math.random() * 2,
        drift: (Math.random() - 0.5) * 1.5,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        rx: shape.rx,
        ry: shape.ry,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.04
      };
    }

    function initLeaves() {
      leaves = [];
      for (let i = 0; i < numLeaves; i++) {
        leaves.push(createLeaf());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < numLeaves; i++) {
        let leaf = leaves[i];
        leaf.y += leaf.speed;
        leaf.x += leaf.drift;
        leaf.angle += leaf.spin;
        if (leaf.y > h + 20 || leaf.x < -20 || leaf.x > w + 20) {
          leaves[i] = createLeaf();
          leaves[i].y = -20;
        }
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.rx, leaf.ry, 0, 0, 2 * Math.PI);
        ctx.fillStyle = leaf.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    initLeaves();
    draw();
  })();

  // Custom scrollbar logic for .install-options

  const wrappers = document.querySelectorAll('.install-options-wrapper');

  wrappers.forEach(wrapper => {
    const scrollArea = wrapper.querySelector('.install-options');
    const scrollbar = wrapper.querySelector('.custom-scrollbar');
    const thumb = wrapper.querySelector('.custom-thumb');

    function updateThumb() {
      const scrollWidth = scrollArea.scrollWidth;
      const clientWidth = scrollArea.clientWidth;
      const scrollLeft = scrollArea.scrollLeft;
      const ratio = clientWidth / scrollWidth;
      const thumbWidth = Math.max(clientWidth * ratio, 60); // min width
      const maxThumbLeft = clientWidth - thumbWidth;
      const maxScrollLeft = scrollWidth - clientWidth;
      const thumbLeft = maxScrollLeft > 0 ? (scrollLeft / maxScrollLeft) * maxThumbLeft : 0;
      thumb.style.width = thumbWidth + 'px';
      thumb.style.left = thumbLeft + 'px';
    }

    // Sync thumb on scroll
    scrollArea.addEventListener('scroll', updateThumb);
    window.addEventListener('resize', updateThumb);
    updateThumb();

    // Drag to scroll
    let isDragging = false;
    let dragStartX = 0;
    let startScrollLeft = 0;

    thumb.addEventListener('mousedown', function (e) {
      isDragging = true;
      dragStartX = e.clientX;
      startScrollLeft = scrollArea.scrollLeft;
      thumb.classList.add('active');
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      const scrollWidth = scrollArea.scrollWidth;
      const clientWidth = scrollArea.clientWidth;
      const ratio = clientWidth / scrollWidth;
      const thumbWidth = Math.max(clientWidth * ratio, 60);
      const maxThumbLeft = clientWidth - thumbWidth;
      const maxScrollLeft = scrollWidth - clientWidth;
      const dx = e.clientX - dragStartX;
      const scrollDelta = (dx / maxThumbLeft) * maxScrollLeft;
      scrollArea.scrollLeft = startScrollLeft + scrollDelta;
    });

    document.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        thumb.classList.remove('active');
        document.body.style.userSelect = '';
      }
    });

    // Click on scrollbar to jump
    scrollbar.addEventListener('mousedown', function (e) {
      if (e.target === thumb) return;
      const rect = scrollbar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const scrollWidth = scrollArea.scrollWidth;
      const clientWidth = scrollArea.clientWidth;
      const ratio = clientWidth / scrollWidth;
      const thumbWidth = Math.max(clientWidth * ratio, 60);
      const maxThumbLeft = clientWidth - thumbWidth;
      const maxScrollLeft = scrollWidth - clientWidth;
      const thumbCenter = thumbWidth / 2;
      const newThumbLeft = Math.min(Math.max(clickX - thumbCenter, 0), maxThumbLeft);
      const newScrollLeft = (newThumbLeft / maxThumbLeft) * maxScrollLeft;
      scrollArea.scrollLeft = newScrollLeft;
    });
  });

  const leavesBg = document.querySelector('.leaves-bg');
  const leafColors = ['#b983ff', '#8f5cff', '#6a994e', '#386641', '#a7c957', '#f2e8cf'];
  const numLeaves = 20;

  for (let i = 0; i < numLeaves; i++) {
    const leaf = document.createElement('span');
    leaf.className = 'leaf';
    const color = leafColors[Math.floor(Math.random() * leafColors.length)];
    const rx = 16 + Math.random() * 12; // width
    const ry = 7 + Math.random() * 7;   // height
    leaf.style.background = color;
    leaf.style.width = rx + 'px';
    leaf.style.height = ry + 'px';
    leaf.style.borderRadius = '50%';
    leaf.style.position = 'absolute';
    leaf.style.left = Math.random() * 100 + 'vw';
    leaf.style.top = -Math.random() * 20 + 'vh';
    leaf.style.opacity = 0.7;
    leavesBg.appendChild(leaf);
    animateLeaf(leaf);
  }

  function animateLeaf(leaf) {
    const duration = 8 + Math.random() * 6;
    const endLeft = Math.random() * 100;
    leaf.animate([
      { transform: `translateY(0) translateX(0)` },
      { transform: `translateY(100vh) translateX(${endLeft - parseFloat(leaf.style.left)}vw)` }
    ], {
      duration: duration * 1000,
      iterations: Infinity,
      delay: Math.random() * 5000
    });
  }
});
