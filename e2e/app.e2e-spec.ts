import { DendrogramPage } from './app.po';

describe('dendrogram App', () => {
  let page: DendrogramPage;

  beforeEach(() => {
    page = new DendrogramPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
