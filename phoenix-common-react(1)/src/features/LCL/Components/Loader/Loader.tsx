function Loader() {
  return (
    <>
      <style>
        {`
          @keyframes spinLoader {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <span
        style={{
          display: 'inline-block',
          width: '20px',
          height: '20px',
          border: '3px dotted #a7d7fa',
          borderRadius: '50%',
          borderTopColor: '#0e83b1',
          animation: 'spinLoader 0.8s linear infinite',
        }}
      />
    </>
  );
}

export default Loader;
