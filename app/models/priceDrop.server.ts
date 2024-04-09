import invariant from "tiny-invariant";
import db from "../db.server";


export async function getPriceDrop(id:number) {
  const priceDrop = await db.priceDrop.findFirst({ where: { id } });

  if (!priceDrop) {
    return null;
  }

  return priceDrop;
}

export async function getPriceDrops(shop: string) {
  const priceDrops = await db.priceDrop.findMany({
    where: { shop }
  });

  return priceDrops;
}

// async function supplementQRCode(qrCode, graphql) {
//   const qrCodeImagePromise = getQRCodeImage(qrCode.id);

//   const response = await graphql(
//     `
//       query supplementQRCode($id: ID!) {
//         product(id: $id) {
//           title
//           images(first: 1) {
//             nodes {
//               altText
//               url
//             }
//           }
//         }
//       }
//     `,
//     {
//       variables: {
//         id: qrCode.productId,
//       },
//     }
//   );

//   const {
//     data: { product },
//   } = await response.json();

//   return {
//     ...qrCode,
//     productDeleted: !product?.title,
//     productTitle: product?.title,
//     productImage: product?.images?.nodes[0]?.url,
//     productAlt: product?.images?.nodes[0]?.altText,
//     destinationUrl: getDestinationUrl(qrCode),
//     image: await qrCodeImagePromise,
//   };
// }


