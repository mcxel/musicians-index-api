import React from 'react'

type Props = {children: React.ReactNode}

type State = {hasError:boolean, message?:string}

export class ErrorBoundary extends React.Component<Props, State>{
  constructor(props:Props){
    super(props);
    this.state={hasError:false};
  }
  static getDerivedStateFromError(err: any){
    return {hasError:true, message: err?.message||String(err)};
  }
  componentDidCatch(err:any, info:any){
    console.error('ErrorBoundary caught', err, info);
  }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:24,background:'#1b0b1b',color:'#ffc',borderRadius:8}}>
          <h3>Something went wrong</h3>
          <div style={{fontSize:12,opacity:.9,whiteSpace:'pre-wrap'}}>{this.state.message}</div>
          <button onClick={()=>location.reload()} style={{marginTop:12}}>Reload</button>
        </div>
      )
    }
    return this.props.children;
  }
}
