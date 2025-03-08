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
            @media (max-width: 600px) {
                .product {
                    width: 100%;
                    max-width: 300px;
                }
            }
        </style>
    `);

    $("body").append(`<h2>Product Showcase with 3D Models</h2>`);
    $("body").append(`<div id="product-list"></div>`);
    $("body").append(` 
        <div id="product-popup" class="popup">
            <div class="popup-content">
                <span class="close">&times;</span>
                <h2 id="popup-title"></h2>
                <p id="popup-price"></p>
                <p id="popup-details"></p>
            </div>
        </div>
    `);

    $.ajax({
        url: "products.json",
        method: "GET",
        dataType: "json",
        success: function (data) {
            let productList = $("#product-list");
            
            $.each(data, function (index, product) {
                let productItem = $(` 
                    <div class="product" data-id="${product.id}">
                        <img class="normal" src="${product.image}" alt="${product.name}">
                        <img class="rotated" src="${product.image_rotated}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>${product.price}</p>
                    </div>
                `);

                productItem.click(function () {
                    $("#popup-title").text(product.name);
                    $("#popup-price").text(product.price);
                    $("#popup-details").text(product.details);
                    $("#product-popup").fadeIn();
                });

                productList.append(productItem);
            });
        },
        error: function (xhr, status, error) {
            console.error("JSON data could not be loaded:", error);
        }
    });

    $(document).on("click", ".close", function () {
        $("#product-popup").fadeOut();
    });

    $("body").click(function (event) {
        if ($(event.target).is("#product-popup")) {
            $("#product-popup").fadeOut();
        }
    });
});
