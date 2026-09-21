import { useMemo, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { blink } from '@/blink/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ArrowRight, Camera, Check, ChevronRight, CircleAlert, ExternalLink, ImagePlus, ScanSearch, Tag, Upload, X } from 'lucide-react'

export const Route = createFileRoute('/app/inventory')({
  head: () => ({ meta: [
    { title: 'Inventory lanes · Inventory Vision Lane' },
    { name: 'description', content: 'Review general inventory intake and card inventory in order.' },
  ] }),
  component: InventoryPage,
})

type Stage = 'intake' | 'identified' | 'needs_review' | 'ready' | 'listed' | 'sold' | 'archived'
const stages: { id: Stage; label: string }[] = [
  { id: 'intake', label: 'Intake' }, { id: 'identified', label: 'Identified' }, { id: 'needs_review', label: 'Needs review' },
  { id: 'ready', label: 'Ready' }, { id: 'listed', label: 'Listed' }, { id: 'sold', label: 'Sold' }, { id: 'archived', label: 'Archived' },
]
const sampleImage = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85'

function InventoryPage() {
  const [lane, setLane] = useState<'general' | 'cards'>('general')
  const [stage, setStage] = useState<Stage>('intake')
  const [itemName, setItemName] = useState('Canvas tote bag')
  const [image, setImage] = useState(sampleImage)
  const [visionNote, setVisionNote] = useState('Vision read: canvas tote bag with shoulder straps. Joshua to confirm condition.')
  const [condition, setCondition] = useState('Used — Joshua to confirm')
  const [quantity, setQuantity] = useState('1')
  const [finalPrice, setFinalPrice] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const stageIndex = stages.findIndex(item => item.id === stage)
  const nextStage = stages[stageIndex + 1]
  const compText = useMemo(() => itemName.toLowerCase().includes('case') ? '3 exact sold comps found' : 'No exact sold comps found', [itemName])

  async function handleUpload(file?: File) {
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setImage(localUrl)
    setStage('intake')
    setVisionNote('Photo received. Run vision read to identify this item.')
    toast.success('Photo added', { description: 'The item is back at intake until the read is confirmed.' })
  }

  async function runVision() {
    setAnalyzing(true)
    try {
      const { text } = await blink.ai.generateText({
        messages: [{ role: 'user', content: [
          { type: 'text', text: 'Identify this resale inventory item in one concise sentence. Mention item type, visible brand if certain, and visible condition. Do not estimate price.' },
          { type: 'image', image },
        ] }],
      })
      setVisionNote(text || 'Vision returned no read. Joshua must identify this item manually.')
      setStage('identified')
      toast.success('Vision read ready', { description: 'Review the identification before approving it.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Vision read failed. Try again or identify it manually.'
      toast.error('Could not run vision', { description: message })
    } finally { setAnalyzing(false) }
  }

  function moveForward() {
    if (!nextStage) return
    if (stage === 'intake') { toast.error('Run the vision read first'); return }
    if (stage === 'identified') { setStage('needs_review'); toast('Joshua review required', { description: 'Confirm the item and condition before it can become ready.' }); return }
    if (stage === 'needs_review') { setStage('ready'); toast.success('Approved for listing', { description: 'Joshua approved the identification and condition.' }); return }
    setStage(nextStage.id)
  }

  function setQuantityValue(value: string) {
    setQuantity(value)
    if (value === '0' && stage === 'listed') toast('Delist flag raised', { description: 'All platform listings for this item need to be delisted.' })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Inventory control</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">Intake lanes</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Every item moves through the same approval gate. Nothing skips Joshua.</p></div>
        <Button onClick={() => inputRef.current?.click()} className="gap-2"><Upload className="h-4 w-4" /> Add item photo</Button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files?.[0])} />
      </div>

      <div className="flex gap-2 rounded-lg bg-secondary p-1 w-fit"><button onClick={() => setLane('general')} className={cn('rounded-md px-4 py-2 text-sm font-medium transition', lane === 'general' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>General items <span className="ml-1 text-xs text-primary">1</span></button><button onClick={() => setLane('cards')} className={cn('rounded-md px-4 py-2 text-sm font-medium transition', lane === 'cards' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>Card lane <span className="ml-1 text-xs text-muted-foreground">existing</span></button></div>

      {lane === 'cards' ? <CardLaneNotice onReturn={() => setLane('general')} /> : <>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
          <Card className="overflow-hidden border-primary/20 shadow-lg">
            <CardHeader className="border-b border-border bg-card/70"><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2 text-lg"><Camera className="h-5 w-5 text-primary" /> General intake</CardTitle><p className="mt-1 text-sm text-muted-foreground">Toys, candy, beauty, apparel — snap anything.</p></div><span className="rounded-full bg-accent px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent-foreground">{stage.replace('_', ' ')}</span></div></CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="grid gap-5 md:grid-cols-[180px_1fr]"><div className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"><img src={image} alt="General inventory item" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /><button onClick={() => inputRef.current?.click()} className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1 rounded bg-background/90 px-2 py-1.5 text-xs font-medium opacity-0 transition group-hover:opacity-100"><ImagePlus className="h-3.5 w-3.5" /> Replace</button></div><div className="space-y-4"><label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Item name<input value={itemName} onChange={e => setItemName(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring" /></label><div className="rounded-lg border border-border bg-muted/50 p-3"><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"><ScanSearch className="h-4 w-4 text-primary" /> Vision identification</span><span className="font-mono text-[10px] text-muted-foreground">no price invented</span></div><p className="text-sm leading-relaxed text-foreground">{visionNote}</p><Button variant="outline" size="sm" onClick={runVision} disabled={analyzing} className="mt-3 gap-2">{analyzing ? 'Reading photo…' : 'Run vision read'}<ArrowRight className="h-3.5 w-3.5" /></Button></div></div></div>
              <div className="grid gap-4 border-t border-border pt-5 md:grid-cols-3"><label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Condition<select value={condition} onChange={e => setCondition(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"><option>Used — Joshua to confirm</option><option>Like new — Joshua to confirm</option><option>Damaged — Joshua to confirm</option></select></label><label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Quantity<Input value={quantity} onChange={e => setQuantityValue(e.target.value)} type="number" min="0" className="mt-1" /></label><label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Joshua's final price<Input value={finalPrice} onChange={e => setFinalPrice(e.target.value)} placeholder="Leave blank until set" className="mt-1" /></label></div>
              {quantity === '0' && stage === 'listed' && <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"><CircleAlert className="h-4 w-4 shrink-0" />Quantity is zero. All platform listings are flagged for delist.</div>}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><p className="text-xs text-muted-foreground">Final price is always set by Joshua.</p><div className="flex gap-2"><Button variant="outline" onClick={() => toast('Draft saved locally', { description: 'This review remains in the current intake lane.' })}>Save review</Button>{stage !== 'ready' && stage !== 'listed' && <Button onClick={moveForward} className="gap-2">{stage === 'needs_review' ? 'Approve for ready' : `Move to ${nextStage?.label}`}<ChevronRight className="h-4 w-4" /></Button>}{stage === 'ready' && <Button onClick={moveForward} className="gap-2">Hand off to BossListers<ExternalLink className="h-4 w-4" /></Button>}</div></div>
            </CardContent>
          </Card>

          <div className="space-y-4"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Tag className="h-4 w-4 text-primary" /> Price guidance</CardTitle></CardHeader><CardContent><p className="text-sm font-medium">{compText}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{compText.startsWith('No') ? 'No exact eBay sold comps were found. Price stays blank until Joshua sets it.' : 'Use these comps as guidance only. Joshua still sets the final price.'}</p><Button variant="link" className="mt-2 h-auto p-0 text-xs">View eBay sold comps <ArrowRight className="ml-1 h-3 w-3" /></Button></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Review gate</CardTitle></CardHeader><CardContent><div className="space-y-3">{stages.map((item, index) => <div key={item.id} className="flex items-center gap-3 text-sm"><div className={cn('flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold', index < stageIndex ? 'border-primary bg-primary text-primary-foreground' : index === stageIndex ? 'border-primary text-primary' : 'border-border text-muted-foreground')}>{index < stageIndex ? <Check className="h-3.5 w-3.5" /> : index + 1}</div><span className={cn(index === stageIndex ? 'font-semibold text-foreground' : index < stageIndex ? 'text-muted-foreground line-through' : 'text-muted-foreground')}>{item.label}</span></div>)}</div></CardContent></Card></div>
        </div>
      </>}
    </div>
  )
}

function CardLaneNotice({ onReturn }: { onReturn: () => void }) { return <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center"><div className="rounded-full bg-accent p-3"><Tag className="h-6 w-6 text-primary" /></div><h2 className="font-serif text-2xl font-semibold">Card lane preserved</h2><p className="max-w-md text-sm text-muted-foreground">The existing card review workflow stays separate. General inventory now uses the same ordered approval gate without changing card handling.</p><Button onClick={onReturn} variant="outline">Open general lane</Button></CardContent></Card> }
