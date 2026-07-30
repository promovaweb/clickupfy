local stringify = pandoc.utils.stringify

local function is_classification_header(block)
  return block.t == "Header"
    and block.level == 2
    and stringify(block.content) == "Classificação"
end

function Blocks(blocks)
  local filtered = pandoc.List()
  local inside_classification = false

  for _, block in ipairs(blocks) do
    if is_classification_header(block) then
      inside_classification = true
    elseif inside_classification
      and block.t == "Header"
      and block.level <= 2 then
      inside_classification = false
      filtered:insert(block)
    elseif not inside_classification then
      filtered:insert(block)
    end
  end

  return filtered
end
