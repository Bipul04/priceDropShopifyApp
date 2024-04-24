export async function getProductInfo(productField: ProductField, admin: any): Promise<VariantData | undefined> {
    if (productField && productField.value) {
        const productId = productField.value;

        try {
            // Fetch the product details using productHandle
            const productQuery = await admin.graphql(
                `
          query {
            product(id: "${productId}") {
              id
              title
              handle
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                  }
                }
              }
            }
          }
          `
            );

            const graphqlResponse = await productQuery.json();

            const productData = graphqlResponse.data.product;

            if (!productData) {
                throw new Error('Product not found');
            }

            // Filter the response data to the VariantData interface
            const priceDropProduct: VariantData = {
                productId: productData.id,
                productTitle: productData.title,
                productHandle: productData.handle,
                productVariantId: productData.variants.edges[0].node.id,
                originalPrice: productData.variants.edges[0].node.price,
                productImage: productData.featuredImage.url,
                productAlt: productData.featuredImage.altText,
            };

            return priceDropProduct;
        } catch (error) {
            console.error('Error fetching product info:', error);
            throw error;
        }
    }
    return undefined;
}

export async function updatePriceDropMetafield(admin: any, priceDropdata: any) {
    console.log("adksjgkagdsadksj", priceDropdata)
    const variantResponse = await admin.graphql(
        `
      query {
        productVariant(id: "${priceDropdata.productVariantId}") {
          title
          price
        }
      }`
    )

    const varaintData = await variantResponse.json();

    const response = await admin.graphql(
        `
      mutation metaobjectUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
        metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
            metaobject {
                id
              displayName
              fields{
                key
                value
              }
            }
          userErrors {
            field
            message
          }
        }
      }
      `,
        {
            variables: {
                "handle": {
                    "handle": "price-drop-main-value",
                    "type": "price_drop_custom_app"
                },
                "metaobject": {
                    "capabilities": {
                        "publishable": {
                            "status": "ACTIVE"
                        }
                    },
                    "fields": [
                        {
                            "key": "enable_price_drop",
                            "value": priceDropdata.enable_price_drop
                        },
                        {
                            "key": "product",
                            "value": priceDropdata.productId
                        },
                        ...(priceDropdata.productChanged ? [
                            {
                                "key": "product_original_price",
                                "value": varaintData.data.productVariant.price
                            }
                        ] : []),
                        {
                            "key": "percentage_drop_from",
                            "value": priceDropdata.percentage_drop_from
                        },
                        {
                            "key": "percentage_drop_to",
                            "value": priceDropdata.percentage_drop_to
                        },
                        {
                            "key": "time_between_price_drop",
                            "value": priceDropdata.time_between_price_drop
                        }
                    ]
                }
            },
        }
    );
    let priceDrops: PriceDropProduct[] = [];
    const graphqlResponse = await response.json();
    const fields = graphqlResponse.data.metaobjectUpsert.metaobject.fields;
    const productField = fields.find((field: ProductField) => field.key === 'product');
    const productData: VariantData | undefined = await getProductInfo(productField, admin);

    if (productData) {
        const priceDrop: PriceDropProduct = arrangePriceDrop(fields, productData)
        priceDrops.push(priceDrop);
    }
    return priceDrops[0];
}

export function arrangePriceDrop(fields: any, productData: VariantData) {
    const priceDrop: PriceDropProduct = fields.reduce((acc: any, field: any) => {
        let key = field.key;
        let value = field.value;

        if (key === 'enable_price_drop') {
            value = value.toLowerCase() === 'true';
        }

        acc[key as keyof PriceDropProduct] = value;
        return acc;
    }, {} as PriceDropProduct);
    if (productData) {
        priceDrop.productId = productData.productId;
        priceDrop.productTitle = productData.productTitle;
        priceDrop.productHandle = productData.productHandle;
        priceDrop.productVariantId = productData.productVariantId;
        priceDrop.originalPrice = productData.originalPrice;
        priceDrop.productImage = productData.productImage;
        priceDrop.productAlt = productData.productAlt;
    }
    return priceDrop;
}

export async function getMetaObjectGraphql(admin: any, isNew: boolean) {
    let priceDrops: PriceDropProduct[] = [];

    const metaObjectGraphql = await admin.graphql(
        `
    query {
      metaobjectByHandle(handle: {handle: "price-drop-main-value", type: "price_drop_custom_app"}) {
        displayName
        fields {
          key
          value
        }
      }
    }
    `
    );

    const graphqlResponse = await metaObjectGraphql.json();
    const fields = graphqlResponse.data.metaobjectByHandle.fields;
    const productField = fields.find((field: ProductField) => field.key === 'product');
    const productData: VariantData | undefined = await getProductInfo(productField, admin);

    if (fields.length === 0) {
        isNew = true;
    } else {
        if (productData) {
            const priceDrop: PriceDropProduct = arrangePriceDrop(fields, productData)
            priceDrops.push(priceDrop);
        }
    }
    return priceDrops[0];
}