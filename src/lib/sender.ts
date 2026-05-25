/**
 * Sender.net Integration Utility
 * Handles adding subscribers to specific groups to trigger automations.
 */

const SENDER_API_TOKEN = process.env.SENDER_API_TOKEN;

export const SENDER_GROUPS = {
  ACCOUNT_CREATED: "bYZngK",
  ORDER_PLACED: "e1MnRR",
  ORDER_CANCELLED: "b2XoVK",
  RETURN_REQUESTED: "e33pWM",
  REFUND_PROCESSED: "b42qX1",
};

interface SubscriberData {
  email: string;
  firstname?: string;
  lastname?: string;
  fields?: Record<string, any>;
}

export async function addSubscriberToGroup(groupId: string, data: SubscriberData) {
  if (!SENDER_API_TOKEN) {
    console.warn("SENDER_API_TOKEN is not defined. Email automation skipped.");
    return false;
  }

  try {
    const response = await fetch("https://api.sender.net/v2/subscribers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDER_API_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        groups: [groupId],
        // Note: Sender.net supports custom fields if they are pre-defined in the dashboard
        // fields: data.fields 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Sender.net API Error:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to add subscriber to Sender.net:", error);
    return false;
  }
}
