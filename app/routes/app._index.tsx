import { useState } from "react";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
  useActionData,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Bleed,
  Button,
  ChoiceList,
  Divider,
  EmptyState,
  InlineStack,
  InlineError,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail,
  BlockStack,
  PageActions,
} from "@shopify/polaris";
import { FormsIcon, ImageIcon } from "@shopify/polaris-icons";
import db from "../db.server";
import { getPriceDrops } from "../models/priceDrop.server";

type priceDropProduct = {
  id: number;
  title: string;
  shop: string;
  productId: string;
  productHandle: string;
  productTitle: string;
  productAlt: string;
  productImage: string;
  productVariantId: string;
  originalPrice: string;
  oldPriceDrop: string;
  priceDrop: string;
  dropRangeFrom: string;
  dropRangeTo: string;
  dropTime: string;
}

var isNew = false;
export const loader: LoaderFunction = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const priceDrops = await getPriceDrops(session.shop);
  console.log("priceDropspriceDrops", priceDrops.length)

  if (priceDrops.length === 0) {
    isNew = true;
    return [];
  } else {
    isNew = false;
  }
  return priceDrops[0];
};


export const action: ActionFunction = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    const formData = await request.formData();
    const newData: any = {
      ...Object.fromEntries(formData),
      shop
    };

    // Assuming hasId is passed in the request data
    const { hasId, ...data } = newData;
    console.log("dataaa", isNew, data)
    if (isNew === true) {
      const priceDrop = await db.priceDrop.create({ data });
      isNew = false;
      return priceDrop;
    } else {
      const priceDrop = await db.priceDrop.update({
        where: {
          id: parseInt(hasId)
        },
        data: data
      });
      return priceDrop;
    }

  } catch (error) {
    console.error("Error creating price drop:", error);
    return error;
  }
};

export default function priceDropForm() {

  const priceDrop: priceDropProduct = useLoaderData();

  const [formState, setFormState] = useState<priceDropProduct>(priceDrop);
  const [cleanFormState, setCleanFormState] = useState<priceDropProduct>(priceDrop);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";

  async function selectProduct() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "add", // customized action verb, either 'select' or 'add',
    });

    if (products) {
      const { images, id, variants, title, handle, price } = products[0];

      setFormState({
        ...formState,
        productId: id,
        productVariantId: String(variants[0].id),
        productTitle: title,
        productHandle: handle,
        productAlt: String(images[0]?.altText),
        productImage: images[0]?.originalSrc,
        originalPrice: price
      });
    }
  }

  const submit = useSubmit();
  function handleSave() {
    const data = {
      title: formState.title,
      productId: formState.productId || "",
      productVariantId: formState.productVariantId || "",
      productHandle: formState.productHandle || "",
      productTitle: formState.productTitle,
      productAlt: formState.productAlt,
      productImage: formState.productImage,
      originalPrice: formState.originalPrice || "100.00",
      oldPriceDrop: formState.oldPriceDrop || "4.95",
      priceDrop: formState.priceDrop || "95.05",
      dropRangeFrom: formState.dropRangeFrom || "",
      dropRangeTo: formState.dropRangeTo || "",
      dropTime: formState.dropTime || "",
      hasId: formState.id,
    };
    // setCleanFormState({ ...formState });
    // submit(data, { method: "post" });

    submit(data, { method: "post" });
    console.log("rtrtrwaaa", priceDrop)

  }


  return (
    <Page
      title="Product Price Drop"
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as={"h6"} variant="headingLg">
                  Title
                </Text>
                <TextField
                  id="title"
                  helpText="Only store staff can see this title"
                  label="title"
                  labelHidden
                  autoComplete="off"
                  value={formState.title}
                  onChange={(title) => setFormState({ ...formState, title })}
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <InlineStack align="space-between">
                  <Text as={"h5"} variant="headingMd">
                    Product
                  </Text>
                  {formState.productId ? (
                    <Button variant="plain" onClick={selectProduct}>
                      Change product
                    </Button>
                  ) : null}
                </InlineStack>
                {formState.productId ? (
                  <InlineStack blockAlign="center" gap="500">
                    <Thumbnail
                      source={formState.productImage || ImageIcon}
                      alt={formState.productAlt}
                    />
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      {formState.productTitle}
                    </Text>
                  </InlineStack>
                ) : (
                  <BlockStack gap="200">
                    <Button onClick={selectProduct} id="select-product">
                      Select product
                    </Button>
                    {/* {errors.productId ? (
                      <InlineError
                        message={errors.productId}
                        fieldID="myFieldID"
                      />
                    ) : null} */}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="500">

                <Text as={"h5"} variant="headingMd">
                  Percentage (%) drop range
                </Text>
                <InlineStack gap="500" align="start" blockAlign="start">
                  <TextField
                    label="From"
                    type="number"
                    id="dropRangeFrom"
                    min={0}
                    max={100}
                    autoComplete="off"
                    value={formState.dropRangeFrom}
                    onChange={(dropRangeFrom) => setFormState({ ...formState, dropRangeFrom })}
                  />
                  <TextField
                    label="To"
                    type="number"
                    id="dropRangeTo"
                    min={0}
                    max={100}
                    autoComplete="off"
                    value={formState.dropRangeTo}
                    onChange={(dropRangeTo) => setFormState({ ...formState, dropRangeTo })}
                  />
                </InlineStack>
                <Bleed marginInlineStart="200" marginInlineEnd="200">
                  <Divider />
                </Bleed>
                <Text as={"h5"} variant="headingMd">
                  Time between price drops
                </Text>
                <InlineStack gap="500" align="start" blockAlign="start">
                  <TextField
                    label="Time"
                    type="number"
                    autoComplete="off"
                    prefix="Min"
                    id="dropTime"
                    value={formState.dropTime}
                    onChange={(dropTime) => setFormState({ ...formState, dropTime })}
                  />
                </InlineStack>

              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !priceDrop.id || !priceDrop || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onAction: () =>
                  submit({ action: "delete" }, { method: "post" }),
              },
            ]}
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
