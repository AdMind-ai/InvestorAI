import React, { useState } from 'react'
import { Box, Typography, Divider, Button, TextField } from '@mui/material'
import Layout from '../layouts/Layout'
import { useTheme } from '@mui/material/styles'

const CEO: React.FC = () => {
  const theme = useTheme()
  const [fields, setFields] = useState([''])

  const handleAddField = () => {
    if (fields.length < 5) {
      setFields([...fields, ''])
    }
  }

  const handleChange = (index: number, value: string) => {
    const newFields = [...fields]
    newFields[index] = value
    setFields(newFields)
  }

  const allFieldsFilled =
    fields.length > 0 && fields.every((field) => field.trim() !== '')

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: 'calc(3vh)',
          overflow: 'auto',
          height: '100%',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.2vw',
          }}
        >
          <Typography variant="h2" sx={{ marginLeft: '1vw' }}>
            CEO Perception
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              marginRight: '1vw',
              color: theme.palette.text.secondary,
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.secondary.light,
              },
            }}
            onClick={() => console.log('Click!')}
          >
            Cronologia
          </Typography>
        </Box>
        <Divider />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            Scrivi qui fino a tre nomi di persona, business o notizia e scopri
            le percezioni online
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              width: '100%',
              maxWidth: '75vw',
            }}
          >
            {fields.map((field, index) => (
              <TextField
                key={index}
                variant="outlined"
                placeholder={`Inserisci la ${index + 1}ª parola da cercare`}
                fullWidth
                value={field}
                onChange={(e) => handleChange(index, e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '50px',
                    borderRadius: '12px',
                    fontSize: '17px',
                  },
                }}
              />
            ))}
          </Box>

          {fields.length < 5 && (
            <Typography
              variant="subtitle1"
              sx={{
                marginTop: '8px',
                color: theme.palette.secondary.main,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={handleAddField}
            >
              + aggiungi una ricerca
            </Typography>
          )}

          <Button
            variant="contained"
            disabled={!allFieldsFilled}
            sx={{
              marginTop: '16px',
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.secondary,
              textTransform: 'none',
            }}
          >
            Invia
          </Button>
        </Box>
      </Box>
    </Layout>
  )
}

export default CEO
