var data = [
  `<a-gltf-model cursor-listener src="#lemari" position="0 0 0" scale="0.002 0.002 0.002"></a-gltf-model>`,
  `<a-gltf-model cursor-listener src="#chair" position="0 0 0" scale=".4 .4 .4"></a-gltf-model>`,
  `<a-gltf-model cursor-listener src="#meja" position="0 0 0" scale="0.3 0.3 0.3"></a-gltf-model>`,
];

let index = 1;
let currentObject = null;

AFRAME.registerComponent("status", {
  init: function () {
    let status = document.querySelector("#status");
    this.entity = document.querySelector("#objects");
    this.countSelect = 0;

    this.el.addEventListener("onStateChange", (evt) => {
      status.innerHTML = evt.detail.color || evt.detail.data;
    });

    this.el.addEventListener("ar-hit-test-start", (evt) => {
      status.innerHTML = "Start";
    });

    this.el.addEventListener("ar-hit-test-achieved", (evt) => {
      status.innerHTML = "Achieved";
    });

    this.el.addEventListener("ar-hit-test-select", (evt) => {
      status.innerHTML = "Select";
    });
  },
});

AFRAME.registerComponent("control-ar-button", {
  schema: {
    element: { type: "selector" },
  },
  init: function () {
    let el = this.el;
    let scale = 0;
    this.data.element.addEventListener("beforexrselect", (evt) => {
      evt.preventDefault();
    });

    this.data.element.addEventListener("click", (evt) => {
      el.emit("onStateChange", { data: evt.target.id });

      if (currentObject && evt.target.id === "pos-rotation") {
        try {
          currentObject.object3D.rotateY(90);
        } catch (error) {
          el.emit("onStateChange", { data: error.message });
        }
      }

      if (currentObject && evt.target.id === "neg-rotation") {
        try {
          currentObject.object3D.rotateY(-90);
        } catch (error) {
          el.emit("onStateChange", { data: error.message });
        }
      }

      // if (currentObject && evt.target.id === "pos-scale") {
      //   try {
      //     scale += 0.001;
      //     currentObject.object3D.scale.set(scale, scale, scale);
      //   } catch (error) {
      //     el.emit("onStateChange", { data: error.message });
      //   }
      // }

      // if (currentObject && evt.target.id === "neg-scale") {
      //   try {
      //     scale -= 0.001;
      //     currentObject.object3D.scale.set(scale, scale, scale);
      //   } catch (error) {
      //     el.emit("onStateChange", { data: error.message });
      //   }
      // }
    });
  },
});

AFRAME.registerComponent("control-change-object", {
  schema: {
    element: { type: "selector" },
  },
  init: function () {
    let index = 0;
    let btnChange = document.querySelector("#btn-change");
    let objs = document.querySelector("#objects");

    btnChange.addEventListener("click", (evt) => {
      let objectTarget = data[index];
      index++;
      objs.innerHTML = objectTarget;
      currentObject = objs.firstChild;
      if (index >= data.length) {
        index = 0;
      }
    });
  },
});

AFRAME.registerComponent("ar-shadows", {
  // Swap an object's material to a transparent shadows-only material while
  // in AR mode. Intended for use with a ground plane. The object is also
  // set visible while in AR mode, this is useful if it's hidden in other
  // modes due to them using a 3D environment.
  schema: {
    opacity: {
      default: 0.3,
    },
  },
  init: function () {
    this.el.sceneEl.addEventListener("enter-vr", (ev) => {
      this.wasVisible = this.el.getAttribute("visible");
      if (this.el.sceneEl.is("ar-mode")) {
        this.savedMaterial = this.el.object3D.children[0].material;
        this.el.object3D.children[0].material = new THREE.ShadowMaterial();
        this.el.object3D.children[0].material.opacity = this.data.opacity;
        this.el.setAttribute("visible", true);
      }
    });
    this.el.sceneEl.addEventListener("exit-vr", (ev) => {
      if (this.savedMaterial) {
        this.el.object3D.children[0].material = this.savedMaterial;
        this.savedMaterial = null;
      }
      if (!this.wasVisible) this.el.setAttribute("visible", false);
    });
  },
});

AFRAME.registerComponent("cursor-listener", {
  init: function () {
    var lastIndex = -1;
    var COLORS = ["red", "green", "blue"];
    let el = this.el;

    this.el.addEventListener("click", function (evt) {});
  },
});

AFRAME.registerComponent("follow-shadow", {
  schema: { type: "selector" },
  init() {
    this.el.object3D.renderOrder = -1;
    const scene = document.querySelector("a-scene");
    const data = scene.getAttribute("renderer");
    data.exposure = 0.5;
    scene.setAttribute("renderer", data);
  },
  tick() {
    if (this.data) {
      this.el.object3D.position.copy(this.data.object3D.position);
      this.el.object3D.position.y -= 0.001; // stop z-fighting
    }
  },
});
