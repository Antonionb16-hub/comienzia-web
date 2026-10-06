$path = 'script.js'
$content = Get-Content -Path $path -Raw -Encoding UTF8

$old = 'const demoInner = $("#demo-inner");'
$new = @"
// Revelado escalonado de tarjetas de casos
$$(`.case-card`).forEach((card, index) => {
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
"@

if ($content -like "*const demoInner*" -and $content -like "*demo-inner*") {
  if ($content -match [regex]::Escape($old)) {
    $content = $content.Replace($old, $new)
    $content | Out-File -FilePath $path -Encoding UTF8 -NoNewline
    Write-Host "Editado correctamente"
  } else {
    Write-Host "No se encontró el texto exacto"
  }
} else {
  Write-Host "Patrón no encontrado"
}