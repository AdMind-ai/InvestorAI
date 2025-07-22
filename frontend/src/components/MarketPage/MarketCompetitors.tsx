import { useState } from "react";
import { useMarket } from "../../context/MarketContext";
import {
  Box,
  Typography,
  Grow,
  IconButton,
  Dialog,
  DialogTitle,
  TextField,
  DialogActions,
  DialogContent,
  Button,
  Chip,
  Autocomplete,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import type { Competitor } from "../../interfaces/market";
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { fetchWithAuth } from "../../api/fetchWithAuth";
import { toast } from "react-toastify";

const MarketCompetitors = () => {
  const { competitors } = useMarket();
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [visibleCompetitorsCount, setVisibleCompetitorsCount] = useState(12);
  const [hoverIndex, setHoverIndex] = useState<null | number>(null);
  const [sectorInput, setSectorInput] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [competitorToDelete, setCompetitorToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  // Função para adicionar setor
  const handleAddSector = () => {
    const trimmed = sectorInput.trim();
    if (trimmed && !sectors.includes(trimmed)) {
      setSectors((prev) => [...prev, trimmed]);
      setSectorInput('');
    }
  };

  const handleCompetitorsExpand = () => {
    setVisibleCompetitorsCount(visibleCompetitorsCount === 12 ? competitors.length : 12);
  };

  const handleOpenModalAddCompetitor = () => {
    setOpenModalAdd(true)
  }

  const handleCloseModalAddCompetitor = () => {
    setOpenModalAdd(false)
  }

  const handleOpenModalDeleteCompetitor = (competitor: string) => {
    setOpenModalDelete(true)
    setCompetitorToDelete(competitor)
  }

  const handleCancelDeleteCompetitor = () => {
    setOpenModalDelete(false)
  }

  const handleAddCompetitor = async (event: React.FormEvent) => {
    setIsLoading(true)
    event.preventDefault();

    const company = await getCurrentCompany();
    const formData = new FormData(event.target as HTMLFormElement);

    const data = {
      company: company,
      name: formData.get('company_name'),
      stock_symbol: formData.get('stock'),
      sector: sectors.join(','),
      website: formData.get('website'),
    };

    try {
      const response = await fetchWithAuth('/competitor/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.status == 201) {
        toast.success("Competitore aggiunto con successo")
      } else {
        toast.error("Errore nell'aggiungere il concorrente")
      }
    }
    catch (e) {
      toast.error("Errore nell'aggiungere il concorrente")
      console.log(e)
    }
    finally {
      handleCloseModalAddCompetitor()
      setIsLoading(false)
    }
  }

  const handleDeleteCompetitor = async (competitor_name: string) => {
    try {
      const response = await fetchWithAuth('/competitor/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: competitor_name })
      })

      if (response.status == 200) {
        toast.success("Competitore eliminato con successo")
      } else {
        const data = response.json()
        console.log(data)
      }

    }
    catch (e) {
      toast.error("Errore nell'eliminazione del concorrente. Riprova")
      console.log(e)
    }
  }

  const getCurrentCompany = async () => {
    const response = await fetchWithAuth('/company-info')
    const data = await response.json();

    return data.long_name
  }

  return (
    <Box sx={{
      position: 'relative',
      // flex: 1, 
      maxHeight: '760px',
      border: '1px solid #ddd',
      borderRadius: 3,
      padding: 3,
      boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <Typography variant="body2" fontWeight="bold" color="#10AF2A">
          Aziende competitors
        </Typography>

        <IconButton onClick={handleOpenModalAddCompetitor}>
          <AddIcon></AddIcon>
        </IconButton>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 12fr)',
        gap: 1,
        my: 3,
        alignItems: 'center',
        justifyItems: 'center',
        width: '100%',
      }}>
        {competitors.slice(0, visibleCompetitorsCount).map((company: Competitor, index: number) => (
          <Box
            key={index}
            sx={{
              width: '120px',
              height: '120px',
              position: 'relative',
              cursor: 'pointer',
              ':hover': {
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                borderRadius: 2,
              }
            }}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
            onClick={() => window.open(company.website, '_blank')}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                width: '100%',
                height: '100%',
                mb: 2,
                '&:hover .remove-icon': {
                  opacity: 0.9,
                  backgroundColor: 'transparent'
                },
              }}
            >
              <IconButton
                className="remove-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModalDeleteCompetitor(company.competitor)}
                }
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  opacity: 0,
                  transition: 'opacity 0.3s ease-in-out',
                  zIndex: 1,
                }}
              >
                <RemoveCircleIcon fontSize="small" color="error" sx={{
                  ":hover": {
                    color: '#ff0000ff'
                  }
                }} />
              </IconButton>
              <Box component="img" src={company.logo}
                sx={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain',
                  marginBottom: '10px',
                }}
              />
              <Typography variant="caption" sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}>{company.competitor}</Typography>
            </Box>

            <Grow in={hoverIndex === index} timeout={'auto'} unmountOnExit >
              <Box sx={{
                position: 'absolute',
                top: '100%',
                left: '-60%',
                width: '200px',
                bgcolor: 'white',
                border: '1px solid #ccc',
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                p: 1,
                zIndex: 10,
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  {company.description}
                </Typography>
              </Box>
            </Grow>

          </Box>
        ))}
      </Box>

      <Typography
        onClick={handleCompetitorsExpand}
        sx={{
          position: 'absolute',
          bottom: 15,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          fontSize: '1rem',
          color: "#888",
          textDecoration: 'underline',
        }}
      >
        {visibleCompetitorsCount === 12 ? "Espandi" : "Retract"}
      </Typography>

      {/* Modal para add competitor */}
      <Dialog open={openModalAdd} onClose={handleCloseModalAddCompetitor} maxWidth='lg'>
        <DialogTitle>Aggiungi competitor</DialogTitle>
        <DialogContent sx={{ paddingBottom: 0 }}>
          <Typography variant="subtitle2" color="textDisabled">
            Compila le informazioni qui sotto per aggiungere un nuovo competitor.
          </Typography>

          <form onSubmit={handleAddCompetitor}>
            <Box sx={{
              mt: 1.5,
              width: 'calc(40vw)'
            }}>
              {/* <TextField
                autoFocus
                required
                margin="dense"
                id="company"
                name="company"
                label="Company"
                type="text"
                fullWidth
                variant="outlined"
              /> */}
              <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 3
              }}>
                <TextField
                  required
                  margin="dense"
                  id="company_name"
                  name="company_name"
                  label="Company Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  margin="dense"
                  id="stock"
                  name="stock"
                  label="Stock Symbol"
                  type="text"
                  fullWidth
                  variant="outlined"
                />
              </Box>


              <TextField
                required
                margin="dense"
                id="website"
                name="website"
                label="Website"
                type="url"
                fullWidth
                variant="outlined"
                sx={{
                  mt: 2
                }}
              />

              <Autocomplete
                sx={{
                  mt: 2
                }}
                multiple
                freeSolo
                disableClearable
                value={sectors}
                inputValue={sectorInput}
                onInputChange={(e, newInputValue) => {
                  console.log(e)
                  setSectorInput(newInputValue);
                }}
                onChange={(e, newValue) => {
                  console.log(e)
                  setSectors(newValue);
                }}
                options={[]}
                renderTags={(value: string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sectors"
                    variant="outlined"
                    size="small"
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleAddSector} size="small" color="primary">
                              <AddIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    }}
                  />
                )}
              />

            </Box>

            <Box sx={{
              display: 'flex',
              justifyContent: "center",
              mt: 2,
              mb: 2,
            }}>
              <DialogActions>
                <Button onClick={handleCloseModalAddCompetitor} variant="outlined" disabled={isLoading}>Cancellare</Button>
                <Button type="submit" variant="outlined">
                  {isLoading ? <CircularProgress size={24} color="primary" /> : 'Aggiungi'}
                </Button>
              </DialogActions>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para deletar competidor */}
      <Dialog open={openModalDelete} onClose={handleCancelDeleteCompetitor} fullWidth={true} maxWidth='xs'>
        <DialogTitle variant="h4">Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2">
            Sei sicuro di voler eliminare il concorrente?
          </Typography>
        </DialogContent>
        <DialogActions sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mb: 1,
          mt: 1
        }}>
          <Button onClick={handleCancelDeleteCompetitor} variant="outlined" disabled={isLoading}>Cancellare</Button>
          <Button onClick={() => handleDeleteCompetitor(competitorToDelete as string)} variant="outlined">
            {isLoading ? <CircularProgress size={24} color="primary" /> : 'Confermare'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarketCompetitors;

