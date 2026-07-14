import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
const env = {}
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k) env[k.trim()] = v.join('=').trim()
})

const supabaseUrl = env['VITE_SUPABASE_URL']
const supabaseKey = env['VITE_SUPABASE_ANON_KEY']
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase.from('informes').select('*').eq('id', 'indice-fada-pba-2026').single()
  if (error) {
    console.error('Error:', error)
    return
  }
  console.log('Title:', data.titulo)
  console.log('Municipios type:', typeof data.municipios, Array.isArray(data.municipios) ? 'Array' : '')
  console.log('Municipios value:', data.municipios)
  console.log('Insights type:', typeof data.insights, Array.isArray(data.insights) ? 'Array' : '')
  console.log('Insights value:', data.insights)
}
run()
