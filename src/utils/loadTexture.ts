import * as THREE from "three";

const randInRange = (xmin:number, xmax:number, randVal:number) => (
    (xmax - xmin) * randVal + xmin
)

const loadTextureF = async (url: string) => {
  return new Promise((resolve, reject) => {
    // const texture : THREE.Texture;
    const onLoadF = function () {
      resolve(texture);
      
    };
    const onProgressF = function () { };
    const onErrorF = function (url) {
      resolve(false);
      
    };
    const managerv = new THREE.LoadingManager(onLoadF, onProgressF, onErrorF);
    const loaderv = new THREE.TextureLoader(managerv);
    const texture = loaderv.load(url);
   });
}

export {loadTextureF, randInRange}