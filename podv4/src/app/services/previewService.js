import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

export class PreviewService {
    constructor() {
        this.loader = new STLLoader();
    }
    loadModel(fileURL) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                fileURL,
                (geometry) => {
                    // STL loader returns a Geometry or BufferGeometry
                    resolve(geometry);
                },
                undefined,
                reject
            );
        });
    }

    getDimensions(geometry) {
        geometry.computeBoundingBox();
        const { min, max } = geometry.boundingBox;

        return {
            width: max.x - min.x,
            height: max.y - min.y,
            depth: max.z - min.z
        };
    }

    checkModelDimensions(geometry) {
        const mesh = new THREE.Mesh(geometry);
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const size = boundingBox.getSize(new THREE.Vector3());
        return {
            length: parseFloat(size.x.toFixed(2)),
            width: parseFloat(size.y.toFixed(2)),
            height: parseFloat(size.z.toFixed(2)),
        };
    }
}
