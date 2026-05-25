import { defineField, defineType } from "sanity";
import { ContentCreatedInput } from "../components/ContentCreatedInput";
import { LocationInput } from "../components/LocationInput";

export const photo = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "filename",
      title: "File Name",
      type: "string",
      readOnly: true,
      hidden: true,
      description: "Used by the sync script to track the source file.",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Landscape", value: "landscape" },
          { title: "Portrait", value: "portrait" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      description: "Date the photo was taken (populated by sync script)",
    }),
    defineField({
      name: "contentCreated",
      title: "Time and date",
      type: "string",
      description: "Read from the selected image metadata.",
      readOnly: true,
      components: {
        input: ContentCreatedInput,
      },
    }),
    defineField({
      name: "phone",
      title: "Phone Model",
      type: "string",
      options: {
        list: [
          { title: "iPhone 15 Pro", value: "iPhone 15 Pro" },
          { title: "iPhone 15", value: "iPhone 15" },
          { title: "iPhone 14 Pro", value: "iPhone 14 Pro" },
          { title: "iPhone 13 Pro", value: "iPhone 13 Pro" },
          { title: "Google Pixel 8", value: "Google Pixel 8" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
        metadata: ["exif", "image", "location"],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
      description: "Describe the photo for screen readers and SEO.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "E.g. Tokyo, JP — shown on hover overlay",
      components: {
        input: LocationInput,
      },
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first. Leave blank for automatic.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "image",
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Title A–Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
