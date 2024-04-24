import { useCallback, useState } from "react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
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
  Checkbox,
} from "@shopify/polaris";
import { FormsIcon, ImageIcon } from "@shopify/polaris-icons";
import db from "../db.server";
import { getPriceDrops } from "../models/priceDrop.server";
import { arrangePriceDrop, getMetaObjectGraphql, getProductInfo, updatePriceDropMetafield } from "~/config/allFunctions";

var isNew = false;

export const loader: LoaderFunction = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  return getMetaObjectGraphql(admin, isNew);
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { shop } = session;

    const formData = await request.formData();
    const newData: any = {
      ...Object.fromEntries(formData),
      shop
    };

    // Assuming hasId is passed in the request data
    const { hasId, productChanged, enableCornJobChanged, timeBetweenPriceDropChanged, ...data } = newData;
    if (isNew === true) {
      const priceDrop = await db.priceDrop.create({ data });
      isNew = false;
      return priceDrop;
    } else {
      // const priceDrop = await db.priceDrop.update({
      //   where: {
      //     id: parseInt(hasId)
      //   },
      //   data: data
      // });

      const priceDrop = await updatePriceDropMetafield(admin, newData); // Assuming updatePriceDropMetafield returns a promise
      return priceDrop;
    }

  } catch (error) {
    console.error("Error creating price drop:", error);
    return error;
  }
};



export default function priceDropForm() {

  const priceDrop: PriceDropProduct = useLoaderData();

  const [formState, setFormState] = useState<PriceDropProduct>(priceDrop);
  const [cleanFormState, setCleanFormState] = useState<PriceDropProduct>(priceDrop);
  const [productChanged, setProductChanged] = useState<boolean>(false);
  const [enableCornJobChanged, setEnableCornJobChanged] = useState<boolean>(false);
  const [timeBetweenPriceDropChanged, setTimeBetweenPriceDropChanged] = useState<boolean>(false);

  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";

  async function selectProduct() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select", // customized action verb, either 'select' or 'add',
      filter: {
        hidden: true,
        variants: false,
        draft: false,
        archived: false,
      },
    });

    if (products) {
      const { images, id, variants, title, handle, price } = products[0];
      if (formState.productId != id) {
        setProductChanged(true);
      } else if (formState.productId === id) {
        setProductChanged(false);
      }

      setFormState({
        ...formState,
        productId: id,
        productVariantId: String(variants[0].id),
        productTitle: title,
        productHandle: handle,
        productAlt: String(images[0]?.altText),
        productImage: images[0]?.originalSrc,
        originalPrice: price,
      });
    }
  }
  const submit = useSubmit();
  async function handleSave() {
    try {
      const data = {
        title: formState.title,
        enable_price_drop: formState.enable_price_drop,
        productId: formState.productId || "",
        productVariantId: formState.productVariantId || "",
        productHandle: formState.productHandle || "",
        productTitle: formState.productTitle,
        productAlt: formState.productAlt || "",
        productImage: formState.productImage,
        originalPrice: formState.originalPrice || "",
        last_price_drop_value: formState.last_price_drop_value || "",
        priceDrop: formState.priceDrop || "",
        percentage_drop_from: formState.percentage_drop_from || "",
        percentage_drop_to: formState.percentage_drop_to || "",
        time_between_price_drop: formState.time_between_price_drop || "",
        hasId: formState.id,
        productChanged: productChanged,
        enableCornJobChanged: enableCornJobChanged,
        timeBetweenPriceDropChanged: timeBetweenPriceDropChanged,
      };
      const response = submit(data, { method: "post" });
      console.log("Response:", response); // Print the response
      shopify.toast.show('Changes saved', { duration: 5000 });
    } catch (error) {
      console.error("Error:", error); // Handle any errors
      shopify.toast.show('Failed to save changes', { duration: 5000 });
    }
  }



  const handleCornJobEnable = useCallback(
    (newEnableCornJob: boolean) => {
      const originalEnablePriceDrop = formState.enable_price_drop;
      const enableCornJobChanged = newEnableCornJob !== originalEnablePriceDrop;
      setEnableCornJobChanged(enableCornJobChanged);
      setFormState({ ...formState, enable_price_drop: newEnableCornJob });
    },
    [formState]
  );
  const handleTimeBetweenPriceDropChange = useCallback(
    (newTimeBetweenPriceDrop: string) => {
      const originalTimeBetweenPriceDrop = formState.time_between_price_drop;
      const timeBetweenPriceDropChanged = newTimeBetweenPriceDrop !== originalTimeBetweenPriceDrop;

      setTimeBetweenPriceDropChanged(timeBetweenPriceDropChanged);
      setFormState({ ...formState, time_between_price_drop: newTimeBetweenPriceDrop });
    },
    [formState]
  );


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
                  disabled
                />
                <Checkbox
                  label="Enable Timer to Start"
                  id="enable_price_drop"
                  checked={formState.enable_price_drop}
                  onChange={handleCornJobEnable}
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
                    id="percentage_drop_from"
                    min={0}
                    max={100}
                    autoComplete="off"
                    value={formState.percentage_drop_from}
                    onChange={(percentage_drop_from) => setFormState({ ...formState, percentage_drop_from })}
                  />
                  <TextField
                    label="To"
                    type="number"
                    id="percentage_drop_to"
                    min={0}
                    max={100}
                    autoComplete="off"
                    value={formState.percentage_drop_to}
                    onChange={(percentage_drop_to) => setFormState({ ...formState, percentage_drop_to })}
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
                    id="time_between_price_drop"
                    value={formState.time_between_price_drop}
                    // onChange={(time_between_price_drop) => setFormState({ ...formState, time_between_price_drop })}
                    onChange={handleTimeBetweenPriceDropChange}
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
