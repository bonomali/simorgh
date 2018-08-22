import {
  checkElementStyles,
  getElement,
  visibleImageNoCaption,
  visibleImageWithCaption,
  shouldContainText,
} from '../support/testHelper';

describe('Article Body Tests', () => {
  // eslint-disable-next-line no-undef
  before(() => {
    // Only 'c0000000025o' & 'c0000000027o' are available within the PROD enviroment
    cy.visit('/news/articles/c0000000025o');
  });

  it('should render a headline', () => {
    checkElementStyles(
      'h1',
      'Royal wedding 2018: Bouquet laid on tomb of unknown warrior',
      'rgb(34, 34, 34)',
      'ReithSerifNewsMedium, Helvetica, Arial, sans-serif',
    );
  });

  it('should render a subheading', () => {
    checkElementStyles(
      'h2',
      "Queen Victoria's myrtle",
      'rgb(64, 64, 64)',
      'ReithSansNewsRegular, Helvetica, Arial, sans-serif',
    );
  });

  it('should render a paragraph', () => {
    const p = getElement('p');
    shouldContainText(
      p,
      'The Duchess of Sussex has followed tradition by having her bridal bouquet placed on the tomb of the unknown warrior at Westminster Abbey.',
    );
  });

  it('should have a visible image without a caption', () => {
    visibleImageNoCaption(getElement('figure').eq(0));
  });

  it('should have a visible image with a caption', () => {
    visibleImageWithCaption(getElement('figure').eq(2));
  });

  it('should render a title', () => {
    cy.title().should('eq', "Meghan's bouquet laid on tomb of unknown warrior");
  });
});
