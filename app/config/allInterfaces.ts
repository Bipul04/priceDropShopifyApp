

interface PriceDropProduct {
    id: number;
    enable_price_drop: boolean;
    title: string;
    shop: string;
    productId: string;
    productTitle: string;
    productHandle: string;
    productVariantId: string;
    originalPrice: string;
    productImage: string;
    productAlt: string;
    last_price_drop_value: string;
    priceDrop: string;
    percentage_drop_from: string;
    percentage_drop_to: string;
    time_between_price_drop: string;
    created_at: string;
}

interface ProductField {
    key: string;
    value: string
}

interface VariantData {
    productId: string;
    productTitle: string;
    productHandle: string;
    productVariantId: string;
    originalPrice: string;
    productImage: string;
    productAlt: string;
}
