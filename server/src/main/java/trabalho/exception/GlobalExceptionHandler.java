package trabalho.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Trata erros de validação do Hibernate Validator (@NotNull, @Size, @Email, etc).
     * Retorna HTTP 400 e uma lista de mensagens.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> erros = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(null, erros));
    }

    /**
     * Trata erros de Regra de Negócio lançados pelos Services (ex: "CNPJ já cadastrado").
     * Retorna HTTP 400 e a mensagem única.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(RuntimeException ex) {
        // Você pode adicionar logs aqui se quiser: ex.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage(), null));
    }

    /**
     * Trata qualquer outro erro não previsto (NullPointer, Banco fora do ar, etc).
     * Retorna HTTP 500 e uma mensagem genérica.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ex.printStackTrace(); // Importante para ver o erro no console do servidor
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Ocorreu um erro interno no servidor. Contate o suporte.", null));
    }

    /**
     * Record interno para formatar o JSON de resposta.
     * O Frontend espera: { "erro": "msg" } ou { "erros": ["msg1", "msg2"] }
     */
    public record ErrorResponse(String erro, List<String> erros) {}
}