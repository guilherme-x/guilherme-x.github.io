const Button = ({ children, onClick, style }) => {
    return (
        <div onClick={() => onClick()} style={{ backgroundColor: '#fff', width: 200, height: 50, justifyContent: 'center', alignItems: 'center', display: 'flex', borderRadius: 30, ...style }}>
            <button className='bold' style={{ color: 'black', fontSize: 20, textAlign: 'center', display: 'flex', alignSelf: 'center' }}>{children}</button>
        </div>
    )
}
export default Button