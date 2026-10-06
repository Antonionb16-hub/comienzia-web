# Replace the case media animation with staggered card animation
$path = 'c:/Users/periq/primera paginaweb/comienzia.es/script.js'
$content = Get-Content -Path $path -Raw -Encoding UTF8

$old = @'
    $$(".case-media img").forEach((img) => {
      gsap.fromTo(
        img,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest(".case-card"),
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    const demoInner = $("#demo-inner");
'@

$new = @'
    $$(".case-media img").forEach((img) => {
      gsap.fromTo(
        img,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest(".case-card"),
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    // Revelado escalonado de tarjetas de casos
    $$(".case-card").forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0.4, y: 18 },
        {
          opacity: 1,
          y: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            toggleActions: "play none none reverse",
          },
          delay: index * 0.08,
          duration: 0.5,
        },
      );
    });

    const demoInner = $("#demo-inner");
'@

if ($content -like "*case-media img*") {
  if ($content -match [regex]::Escape($old)) {
    $content = $content.Replace($old, $new)
    $content | Out-File -FilePath $path -Encoding UTF8 -NoNewline
    Write-Host "Editado correctamente"
  } else {
    Write-Host "No se encontró el contenido exacto"
  }
} else {
  Write-Host "Sección no encontrada"
}