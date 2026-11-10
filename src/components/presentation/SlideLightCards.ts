import { SlideDefinition, SlideCardBlock } from '../../types';

function renderSingleWhiteCard(card: SlideCardBlock): string {
  const borderClass =
    card.accentColor === 'navy'
      ? 'border-navy'
      : card.accentColor === 'orange'
      ? 'border-orange'
      : card.accentColor === 'yellow'
      ? 'border-yellow'
      : '';

  return `
    <article class="white-card ${borderClass}">
      <h3>${card.title}</h3>
      <ul>
        ${card.items
          .map((item) => `<li><strong>${item.bold}</strong> ${item.text}</li>`)
          .join('')}
      </ul>
    </article>
  `;
}

export function renderSlideLightCards(slide: SlideDefinition): string {
  const cards = slide.cards ?? [];
  const cardsHtml =
    cards.length >= 2
      ? `<div class="light-cards-2col">${cards.map(renderSingleWhiteCard).join('')}</div>`
      : `<div class="light-cards-single">${cards.map(renderSingleWhiteCard).join('')}</div>`;

  return `
    <div>
      <header class="light-header-block">
        <h1 class="light-main-title">${slide.title}</h1>
        <p class="light-main-lead">${slide.subtitle}</p>
      </header>
      ${cardsHtml}
      ${
        slide.goldenRule
          ? `<div class="golden-rule-banner ${slide.goldenRule.variant === 'orange' ? 'orange' : ''}">
               <span>${slide.goldenRule.text}</span>
             </div>`
          : ''
      }
    </div>
  `;
}
