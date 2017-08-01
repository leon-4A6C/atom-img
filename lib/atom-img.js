'use babel';

import AtomImgView from './atom-img-view';
import { CompositeDisposable } from 'atom';
const fs = require("fs");
const mime = require("mime");

export default {

  atomImgView: null,
  tooltip: null,

  activate(state) {
    this.atomImgView = new AtomImgView(state.atomImgViewState);

    atom.views.getView(atom.workspace).addEventListener('mousemove', (evt) => {
      this.mouseMove(evt);
    });

  },

  deactivate() {
    this.tooltip.dispose();
    this.atomImgView.destroy();
  },

  serialize() {
    return {
      atomImgViewState: this.atomImgView.serialize()
    };
  },

  mouseMove(evt) {
    if (evt.path[0].classList.contains("syntax--link") && !(evt.path[0].classList.contains("syntax--begin") || evt.path[0].classList.contains("syntax--end")) && this.getLink(evt.path[0].innerHTML)) {
      if (!this.tooltip) {
        let link = this.getLink(evt.path[0].innerHTML);
        this.validateImg(link).then(val => {
          this.addTooltip(evt.path[0], link);
        }).catch(e => {
          // console.log(e);
        });
      }
    } else if (evt.path[0].classList.contains("syntax--string")) {
      if (!this.tooltip) {
        try {
          let text = evt.path[0].childNodes[1].data;
          let path = atom.workspace.getActiveTextEditor().getPath();
          path = path.substr(0, path.lastIndexOf("/")+1)+text;
          if (this.validatePath(text)) {
            this.validateImg(path).then(val => {
              this.addTooltip(evt.path[0], path);
            }).catch(e => {
              // console.log(e);
            });
          } else {
          }

        } catch (e) {
          // console.log(e);
        }
      }
    } else {
      if (this.tooltip) {
        this.removeImg();
      }
    }
  },

  addTooltip(element, path) {
    if (!this.tooltip) {
      this.atomImgView.src = path;
      this.tooltip = atom.tooltips.add(element , {title: "img", item: this.atomImgView.getElement(), trigger: "manual"});
    }
  },

  removeImg() {
    this.tooltip.dispose();
    this.atomImgView.src = "";
    this.tooltip = null;
  },

  getLink(str) {
    if (!(str instanceof String || typeof str === "string")) {
      return false;
    }
    let link = str.match("https:\/\/[-A-Za-z0-9+&@#/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#/%=~_()|]");
    if (!link) {
      link = str.match("http:\/\/[-A-Za-z0-9+&@#/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#/%=~_()|]");
    }
    if (!link) {
      return false;
    }
    return link[0];
  },

  getBlob(uri) {
    return fetch(uri).then(res => {
      return res.blob();
    });
  },

  validateImg(uri) {
    if (this.getLink(uri)) { // it's an url
      return this.getBlob(uri).then(blob => {
        return new Promise((resolve, reject) => {
          if (blob.type.indexOf("image") != -1) {
            resolve(true);
          } else {
            reject(false);
          }
        });
      });
    } else if (this.validatePath(uri)) { // it's a path
      return new Promise((resolve, reject) => {
        if (mime.lookup(uri).indexOf("image") != -1) {
          resolve(true);
        } else {
          reject(false);
        }
      });
    }
  },

  validatePath(path) {
    if (!(path instanceof String || typeof path === "string")) {
      return false;
    }
    let match = path.match("^\/$|(^(?=\/)|^\.|^\.\.)(\/(?=[^/\0])[^/\0]+)*\/?$");
    if (match) {
      return true;
    } else {
      return false;
    }
  }

};
