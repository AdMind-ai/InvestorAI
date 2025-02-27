import { Container, Typography } from '@mui/material'
import CustomButton from '../components/Button'

const Home = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Página Inicial
      </Typography>
      <CustomButton
        text="Clique Aqui"
        onClick={() => alert('Botão clicado!')}
      />
    </Container>
  )
}

export default Home
