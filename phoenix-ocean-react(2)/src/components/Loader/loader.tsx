import LoadingSpinner from "../LoadingSpinner"

function Loader() {
    return(
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(2px)'
    }}>
        <div style={{
            padding: '2rem',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
        }}>
            <LoadingSpinner />
            <span style={{ fontWeight: 500, color: '#ffffff' }}>Saving Quote...</span>
        </div>
    </div>
    )
}

export default Loader