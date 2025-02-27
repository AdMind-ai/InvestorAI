import { Button } from '@mui/material'

interface Props {
  text: string
  onClick: () => void
}

const CustomButton = ({ text, onClick }: Props) => {
  return (
    <Button variant="contained" color="primary" onClick={onClick}>
      {text}
    </Button>
  )
}

export default CustomButton
