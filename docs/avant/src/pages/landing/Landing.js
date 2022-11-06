import './Landing.css';
import logo from '../../assets/images/avant-icon-dark.png'
import phonemock from '../../assets/images/phonemock.png'
import divider from '../../assets/images/divider.png'
import Button from '../../components/Button';

const Landing = () => {
    return (
        <>
            <div className='container'>
                <div className='leftContent'>
                    <img className='logo' width={200} src={logo} alt='Logo' />
                    <img className='phonemock' width={250} src={phonemock} alt='Logo' />
                </div>
                <div className='rightContent'>
                    <img className='divider' draggable="false" width={250} src={divider} alt='Logo' />
                    <h1 className='lightText copy'>
                        Tenha tudo que a sua empresa precisa na palma das suas mãos.
                    </h1>
                    <Button style={{position: 'absolute', right: 100}} onClick={() => window.open('https://play.google.com/store/apps/details?id=com.guilhermex.avant', '_blank', 'noopener,noreferrer')} type='primary'>Testar agora</Button>
                </div>
            </div>
        </>
    )
}
export default Landing