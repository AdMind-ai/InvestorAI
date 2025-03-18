import React, { useEffect, useRef } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { toast } from 'react-toastify'

interface Message {
  sender: 'user' | 'ai'
  content: string
}

interface ChatMessageListProps {
  messages: Message[]
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const parseThinkTag = (content: string) => {
    const regexThink = /<think>([\s\S]*?)<\/think>/i
    const match = content.match(regexThink)
    
    let thinkText = null
    if (match) {
      thinkText = match[1].trim()
      content = content.replace(regexThink, '').trim()
    }

    return { thinkText, content }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Codice copiato!')
  }

  const fixExcessiveLineBreaks = (content: string) => {
    return content.replace(/(<br\s*\/?>\s*){1,}/gi, '<br><br>');
  };

  const processCitations = (text: string, citations: string[]) => {
    return text.replace(/\[(\d+)\]/g, (match, citationNumber) => {
      const link = citations[parseInt(citationNumber) - 1];
      return link ? `[${citationNumber}](${link})` : match;
    });
  };

  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        top: 0, bottom: 0, left: 0, right: 0, 
        overflowY: 'auto', 
        px: '1.1vw', pb: '20vh'
      }}
    >
      {messages.map((msg, idx) => {
        const { thinkText, content: originalContent  } = parseThinkTag(msg.content)
        const content = fixExcessiveLineBreaks(originalContent);
        return (
          <Box key={idx} display="flex" justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'} mb={0.5}>
            <Paper 
              sx={{ 
                maxWidth: '95%',
                px: '1.5rem',
                py: '1rem',
                backgroundColor: msg.sender === 'user' ? '#E6E6E6' : '#F8F8FA',
                borderRadius: '8px',
                boxShadow: 'none',
                overflow: 'hidden',
                mb: '1vw',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontSize: '14px', fontWeight: 'bold', mb: 1 }}>
                {msg.sender === 'user' ? 'TU' : 'AI'}
              </Typography>

              {/* Think Tag */}
              {thinkText && (
                <Box sx={{ bgcolor: '#FFF3CD', borderRadius: '8px', p: 2, my: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#856404', fontSize: '0.9rem' }}>
                    {thinkText}
                  </Typography>
                </Box>
              )}

              {/* Markdown Content */}
              <Typography component="div" sx={{ whiteSpace: 'pre-wrap', fontSize:'1rem', padding: 0 }}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    p: ({ node, children, ...props }) => (
                      <Typography component="p" sx={{ margin: '0px 0', lineHeight: '1.5', fontSize:'1rem' }} {...props}>
                        {children}
                      </Typography>
                    ),
                    ul: ({ children, ...props }) => (
                      <Box component="ul" sx={{ marginY: 0, py:0, pl:3, fontSize:'1rem', lineHeight: '1' }} {...props}>
                        {children}
                      </Box>
                    ),
                    ol: ({ children, ...props }) => (
                      <Box component="ol" sx={{ marginY: 0, py:0, pl:3, fontSize:'1rem', lineHeight: '1' }} {...props}>
                        {children}
                      </Box>
                    ),
                    li: ({ children, ...props }) => (
                      <Typography component="li" sx={{ margin: 0, py:0 , fontSize:'1rem', lineHeight: '0.5' }} {...props}>
                        {children}
                      </Typography>
                    ),
                    h1: ({ children, ...props }) => (
                      <Typography component="h1" sx={{ margin: '4px 0', fontSize:'1.6rem', lineHeight: '1' }} {...props}>
                        {children}
                      </Typography>
                    ),
                    h2: ({ children, ...props }) => (
                      <Typography component="h2" sx={{ margin: '4px 0', fontSize:'1.4rem', lineHeight: '1' }} {...props}>
                        {children}
                      </Typography>
                    ),
                    h3: ({ children, ...props }) => (
                      <Typography component="h3" sx={{ margin: '4px 0', fontSize:'1.2rem', lineHeight: '1' }} {...props}>
                        {children}
                      </Typography>
                    ), 
                    h4: ({ children, ...props }) => (
                      <Typography component="h4" sx={{ margin: '4px 0', fontSize:'1rem', lineHeight: '1' }} {...props}>
                        {children}
                      </Typography>
                    ),
                    table: ({ children, ...props }) => (
                      <Box sx={{ overflowX: 'auto', my: 1 }}>
                        <table
                          {...props}
                          style={{
                            width: '100%',
                            tableLayout: 'fixed', // Isso garante que as colunas sejam fixas e alinhadas
                            borderCollapse: 'collapse',
                            textAlign: 'left', // Ajuste o alinhamento se necessário
                          }}
                        >
                          {children}
                        </table>
                      </Box>
                    ),
                    // Ajustando outras tags de lista, como <thead>, <tbody>, <tr>, <th>, <td>
                    thead: ({ children, ...props }) => (
                      <thead {...props} style={{ backgroundColor: '#f4f4f4', fontWeight: 'bold' }}>
                        {children}
                      </thead>
                    ),
                    tbody: ({ children, ...props }) => (
                      <tbody {...props}>{children}</tbody>
                    ),
                    tr: ({ children, ...props }) => (
                      <tr {...props} style={{ borderBottom: '1px solid #ddd' }}>
                        {children}
                      </tr>
                    ),
                    th: ({ children, ...props }) => (
                      <th {...props} style={{ padding: '8px', border: '1px solid #ddd' }}>
                        {children}
                      </th>
                    ),
                    td: ({ children, ...props }) => (
                      <td {...props} style={{ padding: '8px', border: '1px solid #ddd' }}>
                        {children}
                      </td>
                    ),
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                  
                      return (
                        <Box 
                          sx={{ 
                            bgcolor: '#282C34', 
                            color: '#FFFFFF', 
                            padding: 2, 
                            borderRadius: '8px',
                            position: 'relative',
                            cursor: 'pointer',
                            overflowY: 'auto', 
                            my: 1
                          }}
                          onClick={() => copyToClipboard(String(children).replace(/\n$/, ''))}
                        >
                          <Typography variant="subtitle2" sx={{ 
                            position: 'absolute', 
                            top: 4, 
                            right: 8, 
                            color: '#ffffff88'
                          }}>
                            {language || 'code'} – Click per copiare
                          </Typography>
                          <code {...props}>
                            {children}
                          </code>
                        </Box>
                      );
                    }
                  }}
                >
                  {content}
                </ReactMarkdown>
              </Typography>

            </Paper>
          </Box>
        )
      })}
      <div ref={messagesEndRef}></div>
    </Box>
  )
}

export default ChatMessageList