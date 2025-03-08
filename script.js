$(document).ready(function () {

    $("head").append(`
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #121212;
                color: #ffffff;
                text-align: center;
                transition: background-color 0.3s, color 0.3s;
            }
            h1 {
                margin-top: 20px;
                color: #ff9800;
            }
            
            #product-list {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 20px;
                margin-top: 20px;
            }
            .product {
                display: inline-block;
                padding: 20px;
                border: 1px solid #444;
                cursor: pointer;
                text-align: center;
                background: #1e1e1e;
                color: #ffffff;
                transition: all 0.3s;
                width: 400px;
                height:600px;
                border-radius: 10px;
                position: relative;
                overflow: hidden;
            }
            .product:hover {
                transform: scale(1.1);
                border-color: #ff9800;
            }
            .product img {
                width: 300px;
                height: 400px;
                display: block;
                margin: auto;
                transition: opacity 0.5s ease-in-out;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            .product img.rotated {
                opacity: 0;
            }
            .product:hover img.normal {
                opacity: 0;
            }
            .product:hover img.rotated {
                opacity: 1;
            }
            .popup {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #2c2c2c;
                padding: 20px;
                border: 1px solid #555;
                box-shadow: 0px 0px 10px rgba(255, 152, 0, 0.5);
                border-radius: 10px;
                 width: 500px;
                height: 800px;
            }
            .popup-content {
                text-align: center;
            }
            .close {
                position: absolute;
                top: 10px;
                right: 15px;
                font-size: 20px;
                cursor: pointer;
            }

             #model-container {
                width: 100%;
                height: 400px;
                margin: 10px 0;
            }
            @media (max-width: 600px) {
                .product {
                    width: 100%;
                    max-width: 300px;
                }
            }
        </style>
    `);
    let renderer, scene, camera, controls, currentModel;
    const specialModels = {
        'iphone16.glb': 2.5,
        'headphones.glb': 2.2,
        'keyboard.glb': 1.8,
        'vision.glb': 1.6
    };

   
    $('body').append(`
        <h2>3D Product Showcase</h2>
        <div id="product-list"></div>
        <div id="product-popup" class="popup">
            <div class="popup-content">
                <span class="close">&times;</span>
                <h2 id="popup-title"></h2>
                <p id="popup-price"></p>
                <div id="model-container"></div>
                <p id="popup-details"></p>
            </div>
        </div>
    `);

  
    function initThreeJS() {
        const container = document.getElementById('model-container');
        
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x2c2c2c);
        
        camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.set(0, 0, 5);
        
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(500, 500);
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

      
        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
    }

   
    function loadModel(modelPath) {
        const modelKey = modelPath.split('/').pop();
        const specialScale = specialModels[modelKey] || 1;

        if(currentModel) {
            scene.remove(currentModel);
            currentModel = null;
        }

        new THREE.GLTFLoader().load(modelPath, (gltf) => {
            currentModel = gltf.scene;
            
           
            const box = new THREE.Box3().setFromObject(currentModel);
            const size = box.getSize(new THREE.Vector3()).length();
            const center = box.getCenter(new THREE.Vector3());
            
          
            const baseScale = 3 / size;
            currentModel.scale.setScalar(baseScale * specialScale);
            currentModel.position.sub(center.multiplyScalar(baseScale));
            
            
            const maxDim = Math.max(box.max.x, box.max.y, box.max.z);
            camera.position.z = (maxDim * 2) * specialScale;
            
            scene.add(currentModel);
            setupControls();
            animate();
        });
    }

   
    function setupControls() {
        if(controls) controls.dispose();
        
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.minDistance = 1;
        controls.maxDistance = 15;
        controls.update();
    }

  
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

  
    function handleProductClick(product) {
        if(!renderer) initThreeJS();
        
        $('#popup-title').text(product.name);
        $('#popup-price').text(product.price);
        $('#popup-details').text(product.details);
        
        loadModel(product["3d_model"]);
        $('#product-popup').fadeIn();
    }

  
    $.ajax({
        url: "products.json",
        dataType: "json",
        success: function(products) {
            const productList = $('#product-list');
            
            products.forEach(product => {
                const productItem = $(`
                    <div class="product" data-id="${product.id}">
                        <img class="normal" src="${product.image}">
                        <img class="rotated" src="${product.image_rotated}">
                        <h3>${product.name}</h3>
                        <p>${product.price}</p>
                    </div>
                `).click(() => handleProductClick(product));
                
                productList.append(productItem);
            });
        },
        error: (xhr, status, error) => 
            console.error("Ürünler yüklenemedi:", error)
    });


    $(document)
        .on('click', '.close', () => {
            $('#product-popup').fadeOut();
            if(renderer) {
                controls.dispose();
                renderer.dispose();
                renderer = null;
            }
        })
        .on('click', e => {
            if($(e.target).is('#product-popup')) {
                $('#product-popup').fadeOut();
            }
        });

   
    $(window).resize(() => {
        if(renderer) {
            camera.aspect = 1;
            camera.updateProjectionMatrix();
            renderer.setSize(500, 500);
        }
    });
});