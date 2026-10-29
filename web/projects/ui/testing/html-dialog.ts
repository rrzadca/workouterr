// jsdom has no modal dialogs: showModal() and close() only set and clear `open` here (and close() sends `close`), so
// specs can see a dialog open. Moving focus and making the page inert are the browser's, and untested.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
};
