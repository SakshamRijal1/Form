const images = {
  contact:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=80",

  rsvp:
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1400&q=80",

  tshirt:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",

  event:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80",

  blank:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
};

const templates = {
  blank: {
    title: "Untitled Form",
    description: "Create your own form from scratch.",

    theme: {
      primaryColor: "#673AB7",
      backgroundColor: "#F5F3FF",
      headerImage: images.blank,
    },

    sections: [
      {
        title: "Section 1",
        description: "",
        questions: [
          {
            title: "Untitled question",
            description: "",
            type: "short_answer",
            options: [],
            required: false,
          },
        ],
      },
    ],
  },

  contact: {
    title: "Contact Information",
    description: "Please provide your contact information.",

    theme: {
      primaryColor: "#2563EB",
      backgroundColor: "#EFF6FF",
      headerImage: images.contact,
    },

    sections: [
      {
        title: "Personal Information",
        description: "Tell us a little about yourself.",
        questions: [
          {
            title: "Full Name",
            type: "short_answer",
            required: true,
          },
          {
            title: "Email Address",
            type: "email",
            required: true,
          },
          {
            title: "Phone Number",
            type: "number",
            required: false,
          },
          {
            title: "Address",
            type: "long_answer",
            required: false,
          },
        ],
      },
    ],
  },

  rsvp: {
    title: "RSVP / Party Invite",
    description: "We would love to know if you can join us!",

    theme: {
      primaryColor: "#DB2777",
      backgroundColor: "#FDF2F8",
      headerImage: images.rsvp,
    },

    sections: [
      {
        title: "RSVP",
        description: "Please confirm your attendance.",
        questions: [
          {
            title: "Your Name",
            type: "short_answer",
            required: true,
          },
          {
            title: "Will you attend?",
            type: "multiple_choice",
            options: [
              "Yes, I will be there",
              "No, unfortunately I can't",
            ],
            required: true,
          },
          {
            title: "Number of Guests",
            type: "number",
            required: false,
          },
          {
            title: "Dietary Preferences",
            type: "checkboxes",
            options: [
              "Vegetarian",
              "Vegan",
              "No preference",
              "Other",
            ],
            required: false,
          },
          {
            title: "Message",
            type: "long_answer",
            required: false,
          },
        ],
      },
    ],
  },

  tshirt: {
    title: "T-Shirt Design",
    description: "Choose your preferred T-shirt design and size.",

    theme: {
      primaryColor: "#EA580C",
      backgroundColor: "#FFF7ED",
      headerImage: images.tshirt,
    },

    sections: [
      {
        title: "T-Shirt Order",
        description: "",
        questions: [
          {
            title: "Full Name",
            type: "short_answer",
            required: true,
          },
          {
            title: "T-Shirt Size",
            type: "dropdown",
            options: [
              "XS",
              "S",
              "M",
              "L",
              "XL",
              "XXL",
            ],
            required: true,
          },
          {
            title: "T-Shirt Color",
            type: "dropdown",
            options: [
              "Black",
              "White",
              "Blue",
              "Red",
              "Green",
            ],
            required: true,
          },
          {
            title: "Quantity",
            type: "number",
            required: true,
          },
          {
            title: "Upload Design",
            type: "file_upload",
            required: false,
          },
        ],
      },
    ],
  },

  event: {
    title: "Event Registration",
    description: "Register for our upcoming event.",

    theme: {
      primaryColor: "#059669",
      backgroundColor: "#ECFDF5",
      headerImage: images.event,
    },

    sections: [
      {
        title: "Registration Details",
        description: "",
        questions: [
          {
            title: "Full Name",
            type: "short_answer",
            required: true,
          },
          {
            title: "Email",
            type: "email",
            required: true,
          },
          {
            title: "Phone",
            type: "number",
            required: false,
          },
          {
            title: "Organization",
            type: "short_answer",
            required: false,
          },
          {
            title: "Ticket Type",
            type: "multiple_choice",
            options: [
              "Regular",
              "Student",
              "VIP",
            ],
            required: true,
          },
          {
            title: "Special Requirements",
            type: "long_answer",
            required: false,
          },
        ],
      },
    ],
  },
};

export function getTemplate(templateName = "blank") {
  const template = templates[templateName] || templates.blank;

  return JSON.parse(JSON.stringify(template));
}

export default templates;