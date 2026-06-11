import { Box } from "@mui/material";
import styles from "../../../../../styles/LCL/OrganizationSearch.module.css";
import { ContactDetail } from "@/hooks/LCL/OrganizationSerach/organizationSerachService";

import contactHeaderIcon from "../../../../../assets/head-contact-icon.png";
import telIcon from "../../../../../assets/tel_icon.png";
import mobileIcon from "../../../../../assets/mobile_icon.png";
import emailIcon from "../../../../../assets/email_icon.png";

type Props = {
  contacts: ContactDetail[];
};

const HYPHEN = "-";

const getValue = (value?: string | null) => {
  
  if (!value || value.trim() === "" || value === "null") return HYPHEN;
  return value;
};


const getHeaderLabel = (type?: string) => {
  switch (type) {
    case "ACCOUNTING_CONTACT":
      return "Accounting Contact";

    case "CONTACT":
      return "Organization Contact";

    case "SALE_CONTACT_1":
      return "Sales Contact 1";

    case "SALE_CONTACT_2":
      return "Sales Contact 2";

    default:
      return type || HYPHEN;
  }
};


const getContactName = (c: ContactDetail) => {
  if (!c.contactName) return HYPHEN;

  if (c.typeContact !== "CONTACT") {
    return `${getValue(String(c.contactName))} (${getValue(
      String(c.designation)
    )})`;
  }

  return getValue(String(c.contactName));
};

export default function POrganizationContactSection({
  contacts,
}: Props) {
  if (!contacts?.length) return null;

 
  const rows: ContactDetail[][] = [];

  contacts.forEach((c, index) => {
    const rowIndex = Math.floor(index / 5);

    if (!rows[rowIndex]) {
      rows[rowIndex] = [];
    }

    rows[rowIndex].push(c);
  });

  return (
    <Box className={styles.expandContactRow}>

      <Box className={styles.expandSectionHeader}>
        <span className={styles.expandSectionTitle}>
          <img
            src={contactHeaderIcon}
            alt=""
            className={styles.contactSectionHeaderIcon}
          />
          Contact
        </span>
      </Box>

<Box className={styles.contactGridWrapper}>
      {rows.map((row, rowIndex) => (
        <Box
          key={rowIndex}
          className={styles.contactGrid}
          style={{
            gridTemplateColumns: `repeat(${row.length}, minmax(280px, 300px))`,
          }}
        >
          {row.map((c, index) => {
           
            const emails =
              c.email && c.email.trim() !== ""
                ? c.email.split(",")
                : [""];

            return (
              <Box
                key={(c.typeContact as string) || index}
                className={styles.contactColumn}
              >

                <Box
                  className={styles.contactColumnHeader}
                >
                  {getHeaderLabel(
                    c.typeContact as string
                  )}
                </Box>


                <Box
                  className={styles.contactRow}
                  style={{
                    fontWeight: "bold",
                    marginLeft: 4,
                  }}
                >
                  {getContactName(c)}
                </Box>


                <Box className={styles.contactRow}>
                  <img
                    src={telIcon}
                    alt="tel"
                    className={styles.contactIcon}
                  />

                  {getValue(String(c.telephone))}
                </Box>


                <Box className={styles.contactRow}>
                  <img
                    src={mobileIcon}
                    alt="mobile"
                    className={styles.contactIcon}
                  />

                  {getValue(String(c.mobile))}
                </Box>


                {emails.map(
                  (email, emailIndex) => (
                    <Box
                      key={emailIndex}
                      className={styles.contactRow}
                    >
                      <img
                        src={emailIcon}
                        alt="email"
                        className={
                          styles.contactIcon
                        }
                      />

                      {getValue(email)}
                    </Box>
                  )
                )}
              </Box>
            );
          })}
        </Box>
      ))}
      </Box>
    </Box>
  );
}