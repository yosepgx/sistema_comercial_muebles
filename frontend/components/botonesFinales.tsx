import CustomButton from "./customButtom"

interface Props {
  ruteo?: () => void;
} 

export const BotonesFinales = ({ruteo}: Props) => {
    return(
    <div className='flex flex-row gap-8 mt-8'>
        <CustomButton type='button' variant='orange' 
        onClick= {ruteo}>
            Salir
        </CustomButton>
        <CustomButton type='submit' variant='primary'>Guardar</CustomButton>
    </div>
    )
}


