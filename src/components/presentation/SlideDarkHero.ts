import { SlideDefinition } from '../../types';
import { renderNetworkVisualSvg } from '../visuals/NetworkVisual';

export function renderSlideDarkHero(slide: SlideDefinition): string {
  const bulletsHtml = (slide.heroBullets ?? [])
    .map(
      (b) => `
      <li>
        <span><strong style="color:var(--brand-yellow); font-weight:800;">${b.bold}</strong> ${b.text}</span>
      </li>
    `
    )
    .join('');

  const titleSize =
    slide.template === 'closing-thanks' ? '62px' : slide.index === 0 ? '54px' : '46px';

  return `
    <div class="dark-hero-grid">
      <div>
        ${slide.yellowTag ? `<span class="yellow-tag-solid">${slide.yellowTag}</span>` : ''}
        <h1 class="hero-big-title" style="font-size:${titleSize};">${slide.title}</h1>
        <p class="hero-Accent-subtitle">${slide.subtitle}</p>
        <div class="dark-glass-box">
          <ul class="dark-glass-list">
            ${bulletsHtml}
          </ul>
        </div>
      </div>
      <div class="hero-visual-wrap">
        ${renderNetworkVisualSvg('hero-visual-svg')}
      </div>
    </div>
  `;
}
