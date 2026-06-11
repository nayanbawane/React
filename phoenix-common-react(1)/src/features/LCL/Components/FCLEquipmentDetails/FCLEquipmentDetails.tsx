// import { Box } from '@mui/material';
// import { AutoTextarea, PModal, PSingleValueSearchableField } from 'phoenix-react-lib';
// import { PDatePicker } from 'phoenix-react-lib';
// import { useState } from 'react';
// import POrganizationSearchPage from '../OrganizationSearch/POrganizationSearchPage';





import { Box } from '@mui/material';
import { AutoTextarea, PModal, PSingleValueSearchableField } from 'phoenix-react-lib';
import { PDatePicker } from 'phoenix-react-lib';
import { useState } from 'react';
import POrganizationSearchPage from '../OrganizationSearch/POrganizationSearchPage';
import styles from '../../../../styles/LCL/equipmentDetails.module.css';
import searchIcon from '../../../../assets/images/search-icon.png';

const equipmentDetails = () => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <Box className={styles.container}>

      {/* Pickup Code */}
      <Box className={styles.fieldWrapper}>
        <PSingleValueSearchableField label="Pickup Container at Code" />

        {/* <button
          type="button"
          onClick={() => setShowSearch(true)}
          className={styles.iconButton}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a73b8" strokeWidth="2.2">
            <circle cx="10.5" cy="10.5" r="8.5" />
            <line x1="16.5" y1="16.5" x2="22" y2="22" />
          </svg>
        </button> */}

        <Box className={styles.searchIcon}>
          <img src={searchIcon} alt="search" className={styles.searchImg} />
          <button
            type="button"
            onClick={() => setShowSearch(true)} > </button>
        </Box>
      </Box>

      {/* Modal */}
      <PModal
        title="Organization Search"
        open={showSearch}
        onClose={() => setShowSearch(false)}
        height={{ xs: '85vh', md: '31rem' }}
        width={{ xs: '95vw', sm: '95vw', md: 1049 }}
        contentSx={{ pl: 0 }}
      >
        <Box>
          <POrganizationSearchPage configKey="forwarder" />
        </Box>
      </PModal>

      {/* Return Code */}
      <Box className={styles.fieldWrapper}>
        <PSingleValueSearchableField label="Return Container to" required />

        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className={styles.iconButton}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a73b8" strokeWidth="2.2">
            <circle cx="10.5" cy="10.5" r="8.5" />
            <line x1="16.5" y1="16.5" x2="22" y2="22" />
          </svg>
        </button>
      </Box>

      {/* Modal duplicate (kept same as your code) */}
      <PModal
        title="Organization Search"
        open={showSearch}
        onClose={() => setShowSearch(false)}
        height={{ xs: '85vh', md: '31rem' }}
        width={{ xs: '95vw', sm: '95vw', md: 1049 }}
        contentSx={{ pl: 0 }}
      >
        <Box>
          <POrganizationSearchPage configKey="forwarder" />
        </Box>
      </PModal>

      {/* Textareas */}
      <Box className={styles.fieldWrapper}>
        <AutoTextarea
          label='Pickup Container at Detail'
          minRows={2}
          autoSize={false}
          height="60px"
        />
      </Box>

      <Box className={styles.fieldWrapper}>
        <AutoTextarea
          label='Return Container to Detail'
          minRows={2}
          autoSize={false}
          height="60px"
        />
      </Box>

      {/* Pickup Date Row */}
      <Box className={styles.grid3Start}>
        <PDatePicker label='Pickup Date' />

        <PSingleValueSearchableField
          label='Pickup Time'
          placeholder='From'
        />

        <PSingleValueSearchableField placeholder='To' />
      </Box>

      {/* Return Date Row */}
      <Box className={styles.grid3}>
        <PDatePicker label='Latest Return Date' />

        <PSingleValueSearchableField
          label='Latest Return Time'
          placeholder='From'
        />

        <PSingleValueSearchableField placeholder='To' />

        <PDatePicker label='Earliest Return Date' />

        <PSingleValueSearchableField
          label='Earliest Return Time'
          placeholder='From'
        />

        <PSingleValueSearchableField placeholder='To' />
      </Box>

    </Box>
  );
};


// const equipmentDetails = () => {
//   const [showSearch, setShowSearch] = useState(false);

//   return (
//     <Box
//       sx={{
//         width: "40%",
//         display: "grid",
//         gridTemplateColumns: "1fr 1fr",
//         columnGap: 1.2,
//         rowGap: 0.0,
//       }}
//     >
//       <Box sx={{ position: "relative", width: "100%" }}>
//         <PSingleValueSearchableField label="Pickup Container at Code" />

//         <button
//           type="button"
//           onClick={() => setShowSearch(true)}
//           style={{
//             position: "absolute",
//             right: 0,
//             top: "calc(50% + 9px)", // adjust because label exists
//             transform: "translateY(-50%)",
//             height: 24,
//             width: 24,
//             display: "grid",
//             placeItems: "center",
//             border: "none",
//             background: "transparent",
//             cursor: "pointer",
//           }}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="13"
//             height="13"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="#1a73b8"
//             strokeWidth="2.2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <circle cx="10.5" cy="10.5" r="8.5" />
//             <line x1="16.5" y1="16.5" x2="22" y2="22" />
//           </svg>
//         </button>
//       </Box>

//       <PModal
//         title="Organization Search"
//         open={showSearch}
//         onClose={() => setShowSearch(false)}
//         height={{ xs: '85vh', md: '31rem' }}
//         width={{ xs: '95vw', sm: '95vw', md: 1049 }}
//         sx={{ backgroundColor: 'white' }}
//         contentSx={{ pl: 0 }}
//       >
//         <Box
//         >
//           <POrganizationSearchPage
//             configKey="forwarder"
//           // onSelect={handleForwarderCodeSelect}
//           />
//         </Box>
//       </PModal>


//       <Box sx={{ position: "relative", width: "100%" }}>
//         <PSingleValueSearchableField
//           label="Return Container to"
//           required={true} />

//         <button
//           type="button"
//           onClick={() => setShowSearch(true)}
//           style={{
//             position: "absolute",
//             right: 0,
//             top: "calc(50% + 9px)", // adjust because label exists
//             transform: "translateY(-50%)",
//             height: 24,
//             width: 24,
//             display: "grid",
//             placeItems: "center",
//             border: "none",
//             background: "transparent",
//             cursor: "pointer",
//           }}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="13"
//             height="13"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="#1a73b8"
//             strokeWidth="2.2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <circle cx="10.5" cy="10.5" r="8.5" />
//             <line x1="16.5" y1="16.5" x2="22" y2="22" />
//           </svg>
//         </button>

//       </Box>
//       <PModal
//         title="Organization Search"
//         open={showSearch}
//         onClose={() => setShowSearch(false)}
//         height={{ xs: '85vh', md: '31rem' }}
//         width={{ xs: '95vw', sm: '95vw', md: 1049 }}
//         sx={{ backgroundColor: 'white' }}
//         contentSx={{ pl: 0 }}
//       >
//         <Box>
//           <POrganizationSearchPage
//             configKey="forwarder"
//           // onSelect={handleForwarderCodeSelect}
//           />
//         </Box>
//       </PModal>

//       <Box
//         sx={{
//           position: "relative", width: "100%"
//         }}
//       >
//         <AutoTextarea
//           label='Pickup Container at Detail'
//           minRows={2}
//           autoSize={false}
//           height="60px"
//         />

//       </Box>

//       <Box sx={{
//         position: "relative", width: "100%",
//       }}>
//         <AutoTextarea
//           label='Return Container to Detail'
//           minRows={2}
//           placeholder=""
//           autoSize={false}
//           height={"60px"}
//         />
//       </Box>

//       <Box
//         sx={{
//           display: "grid",
//           gridTemplateColumns: "repeat(3, 1fr)",
//           gap: 0.5,
//           alignContent: "start",
//           alignItems: "end"
//         }}
//       >
//         <PDatePicker
//           label='Pickup Date'
//         />

//         <PSingleValueSearchableField
//           label='Pickup Time'
//           placeholder='From'
//         />

//         <PSingleValueSearchableField
//           placeholder='To'
//         />
//       </Box>

//       <Box
//         sx={{
//           display: "grid",
//           gridTemplateColumns: "repeat(3, 1fr)",
//           gap: 0.5,
//           alignItems: "end",
//         }}
//       >
//         <PDatePicker
//           label='Latest Return Date'
//         />

//         <PSingleValueSearchableField
//           label='Latest Return Time'
//           placeholder='From'
//         />

//         <PSingleValueSearchableField
//           placeholder='To'
//         />

//         {/* This section is for earliest date and earliest time */}
//         <PDatePicker
//           label='Earliest Return Date'
//         />

//         <PSingleValueSearchableField
//           label='Earliest Return Time'
//           placeholder='From'
//         />

//         <PSingleValueSearchableField
//           placeholder='To'
//         />
//       </Box>
//     </Box>
//   );
// };

export default equipmentDetails
