local function normalize_brand_assets(text)
  return text:gsub("[%.%/]*brand/logo/", "brand/logo/")
end

function Image(image)
  image.src = normalize_brand_assets(image.src)
  return image
end

function RawBlock(block)
  if block.format == "html" then
    block.text = normalize_brand_assets(block.text)
    block.text = block.text:gsub("<source([^>]*)>", "<source%1 />")
    block.text = block.text:gsub("<img([^>]*)>", "<img%1 />")
  end
  return block
end

function RawInline(inline)
  if inline.format == "html" then
    inline.text = normalize_brand_assets(inline.text)
  end
  return inline
end

local function is_logo_picture(block)
  if block.t ~= "Plain" then
    return false
  end
  for _, inline in ipairs(block.content) do
    if inline.t == "RawInline"
      and inline.text:match("<picture")
    then
      return true
    end
  end
  return false
end

function Pandoc(document)
  local blocks = {}
  local index = 1
  while index <= #document.blocks do
    local opening = document.blocks[index]
    local content = document.blocks[index + 1]
    local closing = document.blocks[index + 2]
    if opening
      and opening.t == "RawBlock"
      and opening.text:match('<p align="center">')
      and content
      and is_logo_picture(content)
      and closing
      and closing.t == "RawBlock"
      and closing.text:match("</p>")
    then
      local image = pandoc.Image(
        {pandoc.Str("Logo do ClickUpfy")},
        "brand/logo/icon.png",
        "",
        pandoc.Attr("", {"ebook-logo"}, {{"width", "128"}})
      )
      table.insert(
        blocks,
        pandoc.Div(
          {pandoc.Para({image})},
          pandoc.Attr("", {"ebook-logo-block"})
        )
      )
      index = index + 3
    else
      table.insert(blocks, opening)
      index = index + 1
    end
  end
  local result = pandoc.Pandoc(blocks, document.meta)
  local chapter_anchors = {}
  local header_anchors = {}
  for _, block in ipairs(result.blocks) do
    if block.t == "Header" then
      header_anchors[block.identifier:lower()] = block.identifier
    end
    if block.t == "Header" and block.level == 1 then
      local source = block.identifier:match("^(.-%.md)__")
      if source then
        source = source:lower()
        chapter_anchors[source] =
          chapter_anchors[source] or block.identifier
        local basename = source:match("([^_]+%.md)$")
        if basename then
          chapter_anchors[basename] =
            chapter_anchors[basename] or block.identifier
        end
      end
    end
  end

  return result:walk({
    Link = function(link)
      local target = link.target
      if target:match("^#") then
        local key = target:match("^#(.+%.md)$")
        if key and chapter_anchors[key:lower()] then
          link.target = "#" .. chapter_anchors[key:lower()]
        end
        return link
      end

      local path, fragment = target:match("^([^#]+)#?(.*)$")
      if path and path:match("%.md$") then
        path = path:gsub("^%./", "")
        while path:match("^%.%./") do
          path = path:gsub("^%.%./", "", 1)
        end
        local key = path:gsub("/", "__"):lower()
        local basename = path:match("([^/]+%.md)$")
        local chapter = chapter_anchors[key]
        if not chapter and basename then
          chapter = chapter_anchors[basename:lower()]
        end
        local anchor = chapter
        if fragment ~= "" then
          local scoped = key .. "__" .. fragment:lower()
          anchor = header_anchors[scoped]
          if not anchor and basename then
            scoped = basename:lower() .. "__" .. fragment:lower()
            anchor = header_anchors[scoped]
          end
        end
        if anchor then
          link.target = "#" .. anchor
          return link
        end
      end

      -- O ebook é autocontido: referências que não possuem um capítulo
      -- correspondente continuam legíveis, mas não abrem destinos externos.
      return link.content
    end
  })
end
