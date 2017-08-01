'use babel';

export default class AtomImgView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('atom-img');

    // Create message element
    this.img = document.createElement('img');
    this.img.width = 256;
    this.element.appendChild(this.img);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {};
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  set src(src) {
    this.img.src = src;
  }

  get src() {
    return this.img.src;
  }

}
